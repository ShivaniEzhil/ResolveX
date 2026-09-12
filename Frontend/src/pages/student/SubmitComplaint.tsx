import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { createComplaint } from "../../services/complaintService";
import type { ComplaintItem } from "../../types/complaints";

interface SubmitComplaintProps {
  onNavigateTab?: (id: string) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const SubmitComplaint: React.FC<SubmitComplaintProps> = ({
  onNavigateTab,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [error, setError] = useState("");
  const [submittedComplaint, setSubmittedComplaint] = useState<ComplaintItem | null>(null);

  const isTitleValid = title.length >= 5 && title.length <= 150;
  const isDescValid = description.length >= 10 && description.length <= 2000;
  const isLocationValid = location.length >= 2 && location.length <= 150;
  const isFormValid = isTitleValid && isDescValid && isLocationValid && !fileError;

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateAndSetFile = (file: File | null) => {
    setFileError("");
    if (!file) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Only JPG, JPEG, PNG, and WEBP image formats are supported.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("File size exceeds 5MB limit. Please upload a smaller image.");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    validateAndSetFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    validateAndSetFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await createComplaint({
        title,
        description,
        location,
        file: selectedFile,
      });

      const createdComplaint = result.complaint;

      setSubmittedComplaint(createdComplaint);
      setSubmittedId(createdComplaint.id);
      setIsSubmitted(true);

    } catch (err: unknown) {
      console.error("Complaint submission failed:", err);

      let errorMessage = "Unable to submit your complaint. Please verify your details and try again.";
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response?: {
            data?: {
              detail?: string | Array<{ msg?: string; message?: string }>;
              message?: string;
            };
          };
        };
        const detail = axiosErr.response?.data?.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMessage = detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(", ");
        } else if (typeof axiosErr.response?.data?.message === "string") {
          errorMessage = axiosErr.response.data.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <DashboardLayout
        role="STUDENT"
        title="Complaint Submitted"
        activeItem="submit-complaint"
        onNavigate={onNavigateTab}
      >
        <Card style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--rx-success-bg)",
              color: "var(--rx-success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
            Complaint Successfully Logged!
          </h2>
          <p style={{ color: "var(--rx-text-secondary)", marginBottom: 12 }}>
            Your reference ID is <strong style={{ fontFamily: "var(--rx-font-mono)" }}>{submittedId}</strong>.
          </p>

          <div
            style={{
              background: "#F5F3FF",
              border: "1px solid #DDD6FE",
              padding: 16,
              borderRadius: "var(--rx-radius-md)",
              marginBottom: 24,
              textAlign: "left",
              fontSize: "0.875rem",
              color: "#5B21B6",
            }}
          >
            🤖 <strong>Gemini AI Status:</strong>

            <div style={{ marginTop: 8 }}>
              Complaint analyzed successfully.
            </div>

            {submittedComplaint?.priority && (
              <div>
                <strong>Priority:</strong> {submittedComplaint.priority}
              </div>
            )}

            {submittedComplaint?.category && (
              <div>
                <strong>Category:</strong> {submittedComplaint.category}
              </div>
            )}

            {submittedComplaint?.department && (
              <div>
                <strong>Department:</strong> {submittedComplaint.department}
              </div>
            )}

            {submittedComplaint?.assigned_to && (
              <div>
                <strong>Status:</strong> Automatically assigned to staff.
              </div>
            )}

            {submittedComplaint?.attachment_url && (
              <div style={{ marginTop: 6 }}>
                📎 <strong>Photo Attachment:</strong> Attached ({submittedComplaint.attachment_name || "Image evidence"})
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setTitle("");
                setDescription("");
                setLocation("");
                handleRemoveImage();
                setSubmittedComplaint(null);
                setSubmittedId("");
                setError("");
              }}
            >
              Submit Another
            </Button>
            <Button
              variant="primary"
              onClick={() => onNavigateTab && onNavigateTab("my-complaints")}
            >
              View My Complaints
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="STUDENT"
      title="Submit New Complaint"
      subtitle="Report an issue or concern for automated AI classification and department routing"
      activeItem="submit-complaint"
      onNavigate={onNavigateTab}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* AI Info Banner */}
        <div
          style={{
            background: "var(--rx-primary-light)",
            border: "1px solid var(--rx-primary-border)",
            borderRadius: "var(--rx-radius-lg)",
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--rx-primary)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--rx-primary-hover)" }}>
            <strong>Intelligent AI Routing:</strong> Your complaint will be automatically analyzed by AI and routed directly to the appropriate department staff member with the lowest workload.
          </div>
        </div>

        <Card title="Complaint Submission Form">
          {error && (
            <div
              style={{
                background: "var(--rx-danger-bg)",
                border: "1px solid var(--rx-danger-border)",
                color: "var(--rx-danger)",
                padding: "12px 16px",
                borderRadius: "var(--rx-radius-md)",
                marginBottom: 16,
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label htmlFor="comp-title">
                Complaint Title <span style={{ color: "var(--rx-danger)" }}>*</span>
              </label>
              <input
                id="comp-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wi-Fi outage in Hostel Block B floor 3"
                maxLength={150}
                required
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--rx-text-muted)", marginTop: 4 }}>
                <span>Brief summary of the issue</span>
                <span>{title.length}/150</span>
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="comp-location">
                Exact Location <span style={{ color: "var(--rx-danger)" }}>*</span>
              </label>
              <input
                id="comp-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Science Block Room 204 / Hostel B"
                maxLength={150}
                required
              />
              <div style={{ fontSize: "0.75rem", color: "var(--rx-text-muted)", marginTop: 4 }}>
                Helps staff locate and resolve the issue quickly
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="comp-desc">
                Detailed Description <span style={{ color: "var(--rx-danger)" }}>*</span>
              </label>
              <textarea
                id="comp-desc"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about what happened, when it started, and how many people are affected..."
                maxLength={2000}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--rx-radius-md)",
                  border: "1px solid var(--rx-border)",
                  fontFamily: "var(--rx-font-sans)",
                  fontSize: "0.9375rem",
                  resize: "vertical",
                }}
                required
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--rx-text-muted)", marginTop: 4 }}>
                <span>Minimum 10 characters</span>
                <span>{description.length}/2000</span>
              </div>
            </div>

            {/* Image Attachment (Optional) */}
            <div className="form-group">
              <label htmlFor="comp-file" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>
                  Photo Evidence / Attachment <span style={{ color: "var(--rx-text-muted)", fontWeight: 400 }}>(Optional)</span>
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--rx-text-muted)" }}>
                  JPG, PNG, WEBP (Max 5MB)
                </span>
              </label>

              <input
                ref={fileInputRef}
                id="comp-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  style={{
                    border: `2px dashed ${isDragging ? "var(--rx-primary)" : "var(--rx-border)"}`,
                    background: isDragging ? "var(--rx-primary-light)" : "var(--rx-gray-50)",
                    borderRadius: "var(--rx-radius-md)",
                    padding: "24px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all var(--rx-transition-fast)",
                  }}
                >
                  <svg
                    style={{ margin: "0 auto 8px", color: "var(--rx-text-muted)" }}
                    width="32"
                    height="32"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--rx-text-primary)" }}>
                    Click to browse or drag and drop photo here
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--rx-text-muted)", marginTop: 4 }}>
                    Helps staff visually inspect broken fixtures, leakages, or hardware defects
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 12,
                    background: "var(--rx-gray-50)",
                    border: "1px solid var(--rx-border)",
                    borderRadius: "var(--rx-radius-md)",
                  }}
                >
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Selected attachment preview"
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: "var(--rx-radius-sm)",
                        border: "1px solid var(--rx-border)",
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--rx-text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--rx-text-secondary)", marginTop: 2 }}>
                      {formatFileSize(selectedFile.size)} • {selectedFile.type.split("/")[1]?.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: "none",
                        border: "1px solid var(--rx-border)",
                        padding: "6px 10px",
                        borderRadius: "var(--rx-radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        color: "var(--rx-text-primary)",
                      }}
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        background: "var(--rx-danger-bg)",
                        border: "1px solid var(--rx-danger-border)",
                        color: "var(--rx-danger)",
                        padding: "6px 10px",
                        borderRadius: "var(--rx-radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {fileError && (
                <div
                  style={{
                    color: "var(--rx-danger)",
                    fontSize: "0.75rem",
                    marginTop: 6,
                  }}
                >
                  {fileError}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!isFormValid}
              >
                Submit Complaint
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SubmitComplaint;
