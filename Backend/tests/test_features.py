import io
import asyncio
from unittest.mock import patch
# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
# pyrefly: ignore [missing-import]
from fastapi import UploadFile

from app.main import app
from app.core.config import settings
from app.services.storage_service import (
    validate_image_file,
    upload_complaint_image,
)

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_registration_validation_short_password():
    res = client.post("/api/auth/register", json={
        "name": "Valid Name",
        "email": "student@example.com",
        "password": "short"
    })
    assert res.status_code == 422


def test_registration_validation_invalid_email():
    res = client.post("/api/auth/register", json={
        "name": "Valid Name",
        "email": "notanemail",
        "password": "validPassword123"
    })
    assert res.status_code == 422


def test_registration_validation_short_name():
    res = client.post("/api/auth/register", json={
        "name": "A",
        "email": "student@example.com",
        "password": "validPassword123"
    })
    assert res.status_code == 422


def test_image_validation_valid_jpeg():
    fake_jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 50
    upload = UploadFile(filename="photo.jpg", file=io.BytesIO(fake_jpeg))
    detected = validate_image_file(upload, fake_jpeg)
    assert detected == "image/jpeg"


def test_image_validation_valid_png():
    fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 50
    upload = UploadFile(filename="screenshot.png", file=io.BytesIO(fake_png))
    detected = validate_image_file(upload, fake_png)
    assert detected == "image/png"


def test_image_validation_valid_webp():
    fake_webp = b"RIFF\x00\x00\x00\x00WEBPVP8 " + b"\x00" * 50
    upload = UploadFile(filename="sample.webp", file=io.BytesIO(fake_webp))
    detected = validate_image_file(upload, fake_webp)
    assert detected == "image/webp"


def test_image_validation_invalid_extension():
    fake_txt = b"Hello world text file"
    upload = UploadFile(filename="document.txt", file=io.BytesIO(fake_txt))
    try:
        validate_image_file(upload, fake_txt)
        assert False, "Should have raised 400 for invalid extension"
    except Exception as e:
        assert "400" in str(e) or "Unsupported image format" in str(e)


def test_image_validation_fake_magic_bytes():
    fake_exe_as_jpg = b"MZ\x90\x00\x03\x00" + b"\x00" * 50
    upload = UploadFile(filename="malicious.jpg", file=io.BytesIO(fake_exe_as_jpg))
    try:
        validate_image_file(upload, fake_exe_as_jpg)
        assert False, "Should have raised 400 for invalid magic bytes"
    except Exception as e:
        assert "400" in str(e) or "Invalid image file content" in str(e)


def test_image_validation_oversized():
    oversized_bytes = b"\xff\xd8\xff" + b"\x00" * (6 * 1024 * 1024)
    upload = UploadFile(filename="huge.jpg", file=io.BytesIO(oversized_bytes))
    try:
        validate_image_file(upload, oversized_bytes)
        assert False, "Should have raised 400 for oversized file"
    except Exception as e:
        assert "400" in str(e) or "exceeds maximum allowed size" in str(e)


def test_storage_service_production_fail_without_cloudinary():
    fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    upload = UploadFile(filename="evidence.png", file=io.BytesIO(fake_png))

    with patch.object(settings, "environment", "production"):
        with patch.object(settings, "cloudinary_cloud_name", None):
            try:
                asyncio.run(upload_complaint_image(upload))
                assert False, "Should have raised 503 error in production"
            except Exception as e:
                assert "503" in str(e) or "Cloud image storage service is not configured" in str(e)


def test_storage_service_development_fallback():
    fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 50
    upload = UploadFile(filename="test_dev.png", file=io.BytesIO(fake_png))

    with patch.object(settings, "environment", "development"):
        with patch.object(settings, "cloudinary_cloud_name", None):
            res = asyncio.run(upload_complaint_image(upload))
            assert res["attachment_name"] == "test_dev.png"
            assert res["attachment_type"] == "image/png"
            assert res["attachment_url"].startswith("data:image/png;base64,")
            assert res["attachment_size"] > 0


def test_rbac_can_access_complaint():
    from app.services.complaint_service import can_access_complaint

    complaint = {
        "id": "comp_123",
        "user_id": "student_1",
        "assigned_to": "staff_1",
        "title": "Broken desk",
    }

    student_owner = {"id": "student_1", "role": "STUDENT"}
    student_stranger = {"id": "student_2", "role": "STUDENT"}
    staff_assigned = {"id": "staff_1", "role": "STAFF"}
    staff_unassigned = {"id": "staff_2", "role": "STAFF"}
    admin_user = {"id": "admin_1", "role": "ADMIN"}

    assert can_access_complaint(complaint, student_owner) is True
    assert can_access_complaint(complaint, student_stranger) is False
    assert can_access_complaint(complaint, staff_assigned) is True
    assert can_access_complaint(complaint, staff_unassigned) is False
    assert can_access_complaint(complaint, admin_user) is True


def test_registration_endpoint_success_and_duplicate():
    mock_user = {
        "id": "new_user_123",
        "name": "Jane Student",
        "email": "jane@resolvex.edu",
        "role": "STUDENT",
        "is_active": True,
    }

    with patch("app.routes.auth.register_user", side_effect=[mock_user, None]):
        # 1. Success
        res1 = client.post("/api/auth/register", json={
            "name": "Jane Student",
            "email": "jane@resolvex.edu",
            "password": "Password123!"
        })
        assert res1.status_code == 201
        data1 = res1.json()
        assert data1["message"] == "User registered successfully"
        assert data1["user"]["role"] == "STUDENT"

        # 2. Duplicate (returns 409)
        res2 = client.post("/api/auth/register", json={
            "name": "Jane Student",
            "email": "jane@resolvex.edu",
            "password": "Password123!"
        })
        assert res2.status_code == 409
        assert "already exists" in res2.json()["detail"]


def test_complaint_submit_json_backward_compatibility():
    from app.core.dependencies import get_current_user

    mock_student = {"id": "user_student_1", "role": "STUDENT", "is_active": True}
    mock_created = {
        "id": "comp_999",
        "complaint_number": "CMP-0099",
        "title": "Broken projector in lab 1",
        "description": "The HDMI port on the ceiling projector is loose and disconnects constantly.",
        "location": "Lab 1",
        "status": "SUBMITTED",
        "user_id": "user_student_1",
    }

    app.dependency_overrides[get_current_user] = lambda: mock_student

    try:
        with patch("app.routes.complaints.analyze_complaint", side_effect=Exception("Offline")):
            with patch("app.routes.complaints.find_best_staff", return_value=None):
                with patch("app.routes.complaints.create_complaint", return_value=mock_created):
                    with patch("app.routes.complaints.create_audit_log"):
                        res = client.post("/api/complaints/", json={
                            "title": "Broken projector in lab 1",
                            "description": "The HDMI port on the ceiling projector is loose and disconnects constantly.",
                            "location": "Lab 1",
                        })
                        assert res.status_code == 201
                        data = res.json()
                        assert data["complaint"]["complaint_number"] == "CMP-0099"
                        assert "attachment_url" not in data["complaint"]
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_complaint_submit_multipart_with_image():
    from app.core.dependencies import get_current_user

    mock_student = {"id": "user_student_1", "role": "STUDENT", "is_active": True}
    mock_created = {
        "id": "comp_1000",
        "complaint_number": "CMP-0100",
        "title": "Damaged classroom desk",
        "description": "Desk leg broken in room 104 causing hazard for students sitting near window.",
        "location": "Room 104",
        "status": "SUBMITTED",
        "user_id": "user_student_1",
        "attachment_url": "https://res.cloudinary.com/demo/image/upload/sample.png",
        "attachment_name": "damaged_desk.png",
        "attachment_type": "image/png",
        "attachment_size": 150,
    }

    app.dependency_overrides[get_current_user] = lambda: mock_student

    try:
        with patch("app.routes.complaints.analyze_complaint", side_effect=Exception("Offline")):
            with patch("app.routes.complaints.find_best_staff", return_value=None):
                with patch("app.routes.complaints.create_complaint", return_value=mock_created):
                    with patch("app.routes.complaints.upload_complaint_image", return_value={
                        "attachment_url": "https://res.cloudinary.com/demo/image/upload/sample.png",
                        "attachment_name": "damaged_desk.png",
                        "attachment_type": "image/png",
                        "attachment_size": 150,
                    }):
                        with patch("app.routes.complaints.create_audit_log"):
                            fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 150
                            res = client.post(
                                "/api/complaints/",
                                data={
                                    "title": "Damaged classroom desk",
                                    "description": "Desk leg broken in room 104 causing hazard for students sitting near window.",
                                    "location": "Room 104",
                                },
                                files={
                                    "file": ("damaged_desk.png", io.BytesIO(fake_png), "image/png")
                                }
                            )
                            assert res.status_code == 201
                            data = res.json()
                            assert data["complaint"]["attachment_url"] == "https://res.cloudinary.com/demo/image/upload/sample.png"
                            assert data["complaint"]["attachment_name"] == "damaged_desk.png"
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_complaint_submit_multipart_with_real_jpg():
    from app.core.dependencies import get_current_user

    mock_student = {"id": "user_student_1", "role": "STUDENT", "is_active": True}

    def fake_create(complaint_data, user_id, ai):
        return {
            "id": "comp_jpg_1",
            "complaint_number": "CMP-0101",
            "user_id": user_id,
            "status": "SUBMITTED",
            **complaint_data,
        }

    app.dependency_overrides[get_current_user] = lambda: mock_student

    try:
        with patch.object(settings, "environment", "development"):
            with patch.object(settings, "cloudinary_cloud_name", None):
                with patch("app.routes.complaints.analyze_complaint", side_effect=Exception("Offline")):
                    with patch("app.routes.complaints.find_best_staff", return_value=None):
                        with patch("app.routes.complaints.create_complaint", side_effect=fake_create):
                            with patch("app.routes.complaints.create_audit_log"):
                                real_jpg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00" + b"\x00" * 100
                                res = client.post(
                                    "/api/complaints/",
                                    data={
                                        "title": "Broken window in science lab",
                                        "description": "Glass pane cracked during heavy storm yesterday afternoon.",
                                        "location": "Science Block Lab 3",
                                    },
                                    files={
                                        "file": ("window_damage.jpg", io.BytesIO(real_jpg_bytes), "image/jpeg")
                                    },
                                )
                                assert res.status_code == 201
                                comp = res.json()["complaint"]
                                assert comp["attachment_name"] == "window_damage.jpg"
                                assert comp["attachment_type"] == "image/jpeg"
                                assert comp["attachment_size"] == len(real_jpg_bytes)
                                assert comp["attachment_url"].startswith("data:image/jpeg;base64,")
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_complaint_submit_multipart_with_real_png():
    from app.core.dependencies import get_current_user

    mock_student = {"id": "user_student_1", "role": "STUDENT", "is_active": True}

    def fake_create(complaint_data, user_id, ai):
        return {
            "id": "comp_png_1",
            "complaint_number": "CMP-0102",
            "user_id": user_id,
            "status": "SUBMITTED",
            **complaint_data,
        }

    app.dependency_overrides[get_current_user] = lambda: mock_student

    try:
        with patch.object(settings, "environment", "development"):
            with patch.object(settings, "cloudinary_cloud_name", None):
                with patch("app.routes.complaints.analyze_complaint", side_effect=Exception("Offline")):
                    with patch("app.routes.complaints.find_best_staff", return_value=None):
                        with patch("app.routes.complaints.create_complaint", side_effect=fake_create):
                            with patch("app.routes.complaints.create_audit_log"):
                                real_png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 120
                                res = client.post(
                                    "/api/complaints/",
                                    data={
                                        "title": "Water leak in cafeteria ceiling",
                                        "description": "Ceiling tile soaked and water dripping near food counter.",
                                        "location": "Main Cafeteria",
                                    },
                                    files={
                                        "file": ("cafeteria_leak.png", io.BytesIO(real_png_bytes), "image/png")
                                    },
                                )
                                assert res.status_code == 201
                                comp = res.json()["complaint"]
                                assert comp["attachment_name"] == "cafeteria_leak.png"
                                assert comp["attachment_type"] == "image/png"
                                assert comp["attachment_size"] == len(real_png_bytes)
                                assert comp["attachment_url"].startswith("data:image/png;base64,")
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_complaint_submit_multipart_with_jpg_name_png_magic_bytes():
    """
    Investigate and verify the exact scenario reported from production Render logs:
    filename='lock screen 1.jpg', Content-Type='image/jpeg',
    but actual bytes begin with '\\x89PNG'.
    The backend magic-byte inspection must accurately detect 'image/png' and store the metadata.
    """
    from app.core.dependencies import get_current_user

    mock_student = {"id": "user_student_1", "role": "STUDENT", "is_active": True}

    def fake_create(complaint_data, user_id, ai):
        return {
            "id": "comp_mismatch_1",
            "complaint_number": "CMP-0103",
            "user_id": user_id,
            "status": "SUBMITTED",
            **complaint_data,
        }

    app.dependency_overrides[get_current_user] = lambda: mock_student

    try:
        with patch.object(settings, "environment", "development"):
            with patch.object(settings, "cloudinary_cloud_name", None):
                with patch("app.routes.complaints.analyze_complaint", side_effect=Exception("Offline")):
                    with patch("app.routes.complaints.find_best_staff", return_value=None):
                        with patch("app.routes.complaints.create_complaint", side_effect=fake_create):
                            with patch("app.routes.complaints.create_audit_log"):
                                png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 200
                                res = client.post(
                                    "/api/complaints/",
                                    data={
                                        "title": "Lock screen display failure",
                                        "description": "Library terminal 4 lock screen freeze and will not respond to keyboard.",
                                        "location": "Library 2nd Floor",
                                    },
                                    files={
                                        "file": ("lock screen 1.jpg", io.BytesIO(png_bytes), "image/jpeg")
                                    },
                                )
                                assert res.status_code == 201
                                comp = res.json()["complaint"]
                                assert comp["attachment_name"] == "lock screen 1.jpg"
                                # Magic byte inspection correctly identifies it as image/png
                                assert comp["attachment_type"] == "image/png"
                                assert comp["attachment_size"] == len(png_bytes)
                                assert comp["attachment_url"].startswith("data:image/png;base64,")
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_complaint_submit_multipart_without_image():
    from app.core.dependencies import get_current_user

    mock_student = {"id": "user_student_1", "role": "STUDENT", "is_active": True}

    def fake_create(complaint_data, user_id, ai):
        return {
            "id": "comp_no_img_1",
            "complaint_number": "CMP-0104",
            "user_id": user_id,
            "status": "SUBMITTED",
            **complaint_data,
        }

    app.dependency_overrides[get_current_user] = lambda: mock_student

    try:
        with patch("app.routes.complaints.analyze_complaint", side_effect=Exception("Offline")):
            with patch("app.routes.complaints.find_best_staff", return_value=None):
                with patch("app.routes.complaints.create_complaint", side_effect=fake_create):
                    with patch("app.routes.complaints.create_audit_log"):
                        res = client.post(
                            "/api/complaints/",
                            data={
                                "title": "Air conditioning noisy in study hall",
                                "description": "The AC unit in study room B rattles constantly when fan starts up.",
                                "location": "Study Room B",
                            },
                        )
                        assert res.status_code == 201
                        comp = res.json()["complaint"]
                        assert comp["title"] == "Air conditioning noisy in study hall"
                        assert "attachment_url" not in comp
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_complaint_submit_multipart_validation_error_short_title():
    from app.core.dependencies import get_current_user

    mock_student = {"id": "user_student_1", "role": "STUDENT", "is_active": True}
    app.dependency_overrides[get_current_user] = lambda: mock_student

    try:
        res = client.post(
            "/api/complaints/",
            data={
                "title": "Bad",  # Less than 5 characters
                "description": "This description is long enough to pass validation.",
                "location": "Room 101",
            },
        )
        assert res.status_code == 422
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_complaint_submit_multipart_invalid_magic_bytes():
    from app.core.dependencies import get_current_user

    mock_student = {"id": "user_student_1", "role": "STUDENT", "is_active": True}
    app.dependency_overrides[get_current_user] = lambda: mock_student

    try:
        fake_exe = b"MZ\x90\x00\x03\x00" + b"\x00" * 50
        res = client.post(
            "/api/complaints/",
            data={
                "title": "Broken elevator button",
                "description": "Elevator button 3 does not register clicks on 3rd floor.",
                "location": "Tower A Elevator",
            },
            files={
                "file": ("malicious.jpg", io.BytesIO(fake_exe), "image/jpeg")
            },
        )
        assert res.status_code == 400
        assert "Invalid image file content" in res.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_current_user, None)


def test_complaint_submit_unauthenticated():
    # Calling POST /api/complaints/ without current_user or token should return 401
    res = client.post(
        "/api/complaints/",
        json={
            "title": "Unauthenticated complaint attempt",
            "description": "Should fail with 401 Unauthorized before processing.",
            "location": "Campus Main Gate",
        },
    )
    assert res.status_code == 401

