import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { createComplaint } from "../../services/complaintService";

interface SubmitComplaintProps {
  onNavigateTab?: (id: string) => void;
  onSubmitSuccess?: () => void;
}

export const SubmitComplaint: React.FC<SubmitComplaintProps> = ({
  onNavigateTab,
  onSubmitSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [error, setError] = useState("");
  const [submittedComplaint, setSubmittedComplaint] = useState<any>(null);

  const isTitleValid = title.length >= 5 && title.length <= 150;
  const isDescValid = description.length >= 10 && description.length <= 2000;
  const isLocationValid = location.length >= 2 && location.length <= 150;
  const isFormValid = isTitleValid && isDescValid && isLocationValid;

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
      });

      const createdComplaint = result.complaint;

      setSubmittedComplaint(createdComplaint);
      setSubmittedId(createdComplaint.id);
      setIsSubmitted(true);

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      console.error("Complaint submission failed:", err);

      setError(
        "Unable to submit your complaint. Please try again."
      );
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
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setTitle("");
                setDescription("");
                setLocation("");
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
