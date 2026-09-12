import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";
import type { ComplaintItem } from "../../types/complaints";

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: ComplaintItem | null;
  onUpdateStatus: (complaintId: string, nextStatus: "IN_PROGRESS" | "RESOLVED") => Promise<void>;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onUpdateStatus,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!complaint) return null;

  const currentStatus = complaint.status;
  let nextStatus: "IN_PROGRESS" | "RESOLVED" | null = null;
  let nextStatusLabel = "";
  let actionButtonText = "";
  let transitionDescription = "";

  if (currentStatus === "ASSIGNED") {
    nextStatus = "IN_PROGRESS";
    nextStatusLabel = "In Progress";
    actionButtonText = "Mark as In Progress";
    transitionDescription = "Start work on this complaint and mark it as currently being addressed.";
  } else if (currentStatus === "IN_PROGRESS") {
    nextStatus = "RESOLVED";
    nextStatusLabel = "Resolved";
    actionButtonText = "Mark as Resolved";
    transitionDescription = "Confirm that this grievance has been successfully addressed and resolved.";
  }

  const handleConfirm = async () => {
    if (!nextStatus) return;

    try {
      setIsLoading(true);
      setError("");
      await onUpdateStatus(complaint.id, nextStatus);
      onClose();
    } catch (err: unknown) {
      console.error("Failed to update complaint status:", err);
      setError("Unable to update complaint status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Complaint Status"
      maxWidth={480}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {nextStatus && (
            <Button
              variant="primary"
              isLoading={isLoading}
              onClick={handleConfirm}
            >
              {actionButtonText}
            </Button>
          )}
        </>
      }
    >
      <div>
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--rx-danger-bg)",
              color: "var(--rx-danger)",
              borderRadius: "var(--rx-radius-md)",
              marginBottom: 16,
              fontSize: "0.875rem",
              border: "1px solid var(--rx-danger-border)",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: "var(--rx-gray-50)",
            border: "1px solid var(--rx-border)",
            borderRadius: "var(--rx-radius-md)",
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--rx-font-mono)", fontSize: "0.8125rem", color: "var(--rx-text-muted)" }}>
              {complaint.complaint_number}
            </span>
            <StatusBadge status={currentStatus} />
          </div>

          <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--rx-text-primary)", marginBottom: 4 }}>
            {complaint.title}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--rx-text-secondary)" }}>
            Department: {complaint.department} • Location: {complaint.location}
          </div>
        </div>

        {nextStatus ? (
          <div>
            <div style={{ fontSize: "0.875rem", color: "var(--rx-text-secondary)", marginBottom: 12 }}>
              {transitionDescription}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "var(--rx-primary-light)",
                border: "1px solid var(--rx-primary-border)",
                borderRadius: "var(--rx-radius-md)",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--rx-primary)" }}>
                  Target Status
                </span>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--rx-primary-hover)" }}>
                  {nextStatusLabel}
                </div>
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--rx-primary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "0.875rem", color: "var(--rx-text-secondary)", textAlign: "center", padding: "12px 0" }}>
            This complaint is in <strong>{currentStatus}</strong> status and cannot be transitioned further.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StatusUpdateModal;
