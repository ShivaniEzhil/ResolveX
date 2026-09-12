import base64
import io
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_MIME_TYPES = {
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def validate_image_file(file: UploadFile, file_bytes: bytes) -> str:
    # 1. Size Validation
    max_size = settings.max_upload_size_bytes
    if len(file_bytes) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size exceeds maximum allowed size of {max_size // (1024 * 1024)}MB",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    # 2. Extension check
    filename = (file.filename or "").lower()
    if not any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image format. Allowed formats: JPEG, PNG, WEBP",
        )

    # 3. Magic Bytes Header validation
    detected_mime = None
    if file_bytes.startswith(b"\xff\xd8\xff"):
        detected_mime = "image/jpeg"
    elif file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        detected_mime = "image/png"
    elif file_bytes.startswith(b"RIFF") and len(file_bytes) > 12 and file_bytes[8:12] == b"WEBP":
        detected_mime = "image/webp"

    if not detected_mime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file content. Header does not match standard image format.",
        )

    return detected_mime


async def upload_complaint_image(file: UploadFile) -> dict:
    file_bytes = await file.read()

    # Validate file format and size
    detected_mime = validate_image_file(file, file_bytes)
    original_filename = file.filename or "attachment.jpg"
    file_size = len(file_bytes)

    # Check Cloudinary configuration
    has_cloudinary_config = bool(
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    )

    if has_cloudinary_config:
        try:
            import cloudinary
            import cloudinary.uploader

            cloudinary.config(
                cloud_name=settings.cloudinary_cloud_name,
                api_key=settings.cloudinary_api_key,
                api_secret=settings.cloudinary_api_secret,
                secure=True,
            )

            # Upload buffer to Cloudinary in folder resolvex/complaints
            upload_result = cloudinary.uploader.upload(
                io.BytesIO(file_bytes),
                folder="resolvex/complaints",
                resource_type="image",
            )

            secure_url = upload_result.get("secure_url") or upload_result.get("url")

            return {
                "attachment_url": secure_url,
                "attachment_name": original_filename,
                "attachment_type": detected_mime,
                "attachment_size": file_size,
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Image upload to storage service failed: {str(e)}",
            )

    # If Cloudinary is not configured:
    # Fail cleanly in production mode
    is_production = settings.environment.lower() in ["production", "prod"]
    if is_production:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cloud image storage service is not configured on production server.",
        )

    # Local development / test fallback (data URL format for standalone testing)
    encoded_b64 = base64.b64encode(file_bytes).decode("utf-8")
    data_url = f"data:{detected_mime};base64,{encoded_b64}"

    return {
        "attachment_url": data_url,
        "attachment_name": original_filename,
        "attachment_type": detected_mime,
        "attachment_size": file_size,
    }
