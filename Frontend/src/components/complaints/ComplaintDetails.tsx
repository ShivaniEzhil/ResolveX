import React, { useState } from "react";
import type { ComplaintItem, ComplaintResponseItem } from "../../types/complaints";
import Card from "../common/Card";
import StatusBadge from "../common/StatusBadge";
import PriorityBadge from "../common/PriorityBadge";
import ComplaintStatusTimeline from "./ComplaintStatusTimeline";
import ResponseThread from "./ResponseThread";
import "./complaints.css";

interface ComplaintDetailsProps {
  complaint: ComplaintItem;
  responses?: ComplaintResponseItem[];
  onAddResponse?: (message: string) => void;
  onAssignClick?: () => void;
  onUpdateStatusClick?: () => void;
  showInternalAIInfo?: boolean;
}

export const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({
  complaint,
  responses = [],
  onAddResponse,
  onAssignClick,
  onUpdateStatusClick,
  showInternalAIInfo = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--rx-font-mono)", fontSize: "0.875rem", color: "var(--rx-text-muted)" }}>
                {complaint.complaint_number}
              </span>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
              {complaint.title}
            </h2>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {onAssignClick && complaint.status !== "RESOLVED" && (
              <button
                className="rx-btn rx-btn--outline rx-btn--sm"
                onClick={onAssignClick}
              >
                Reassign Staff
              </button>
            )}
            {onUpdateStatusClick && (complaint.status === "ASSIGNED" || complaint.status === "IN_PROGRESS") && (
              <button
                className="rx-btn rx-btn--primary rx-btn--sm"
                onClick={onUpdateStatusClick}
              >
                {complaint.status === "ASSIGNED" ? "Start Progress" : "Mark as Resolved"}
              </button>
            )}
          </div>
        </div>
      </Card>

      <div className="rx-detail-grid">
        {/* Main Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Metadata & Description */}
          <Card title="Complaint Information">
            <div className="rx-meta-group">
              <div className="rx-meta-item">
                <span className="rx-meta-label">Category</span>
                <span className="rx-meta-value">{complaint.category}</span>
              </div>
              <div className="rx-meta-item">
                <span className="rx-meta-label">Department</span>
                <span className="rx-meta-value">{complaint.department}</span>
              </div>
              <div className="rx-meta-item">
                <span className="rx-meta-label">Location</span>
                <span className="rx-meta-value">{complaint.location}</span>
              </div>
              <div className="rx-meta-item">
                <span className="rx-meta-label">Assigned Staff</span>
                <span className="rx-meta-value">
                  {complaint.assignedStaffName || complaint.assigned_to || "Unassigned"}
                </span>
              </div>
            </div>

            <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 6 }}>
              Description
            </h4>
            <p style={{ fontSize: "0.9375rem", color: "var(--rx-text-primary)", lineHeight: 1.6 }}>
              {complaint.description}
            </p>
          </Card>

          {/* Attached Photo Evidence Section */}
          {complaint.attachment_url && (
            <Card title="Attached Photo Evidence">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    position: "relative",
                    borderRadius: "var(--rx-radius-md)",
                    overflow: "hidden",
                    border: "1px solid var(--rx-border)",
                    cursor: "pointer",
                    maxHeight: 320,
                    backgroundColor: "var(--rx-gray-900)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Click to view full-size photo"
                >
                  <img
                    src={complaint.attachment_url}
                    alt={complaint.attachment_name || "Complaint Photo"}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: 320,
                      objectFit: "contain",
                      display: "block",
                      transition: "transform var(--rx-transition-normal)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "var(--rx-radius-sm)",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                    Click to Zoom
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.8125rem",
                    color: "var(--rx-text-secondary)",
                    paddingTop: 4,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{complaint.attachment_name || "Attached Image"}</span>
                  </div>

                  {complaint.attachment_size && (
                    <span>{formatFileSize(complaint.attachment_size)}</span>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* AI Insights Section */}
          {showInternalAIInfo && (complaint.ai_summary || complaint.ai_reason) && (
            <Card title="AI Classification & Insights">
              <div className="rx-ai-box">
                <div className="rx-ai-header">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Automated Gemini AI Classification
                </div>

                {complaint.ai_summary && (
                  <div style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: "0.8125rem", color: "#5B21B6" }}>Summary: </strong>
                    <span style={{ fontSize: "0.875rem", color: "var(--rx-text-primary)" }}>{complaint.ai_summary}</span>
                  </div>
                )}

                {complaint.ai_reason && (
                  <div>
                    <strong style={{ fontSize: "0.8125rem", color: "#5B21B6" }}>Routing Reason: </strong>
                    <span style={{ fontSize: "0.875rem", color: "var(--rx-text-primary)" }}>{complaint.ai_reason}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Updates & Responses Thread */}
          <Card title="Responses & Updates">
            <ResponseThread
              responses={responses}
              onAddResponse={onAddResponse}
            />
          </Card>
        </div>

        {/* Sidebar Column: Timeline & Audit */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Resolution Progress">
            <ComplaintStatusTimeline
              status={complaint.status}
              createdAt={complaint.created_at}
              updatedAt={complaint.updated_at}
              hasAIAnalysis={!!complaint.ai_summary}
            />
          </Card>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isModalOpen && complaint.attachment_url && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Action Bar */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "white",
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                {complaint.attachment_name || "Complaint Photo Attachment"}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <a
                  href={complaint.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "white",
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "6px 12px",
                    borderRadius: "var(--rx-radius-sm)",
                    fontSize: "0.8125rem",
                    textDecoration: "none",
                  }}
                >
                  Open Original ↗
                </a>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "var(--rx-radius-sm)",
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <img
              src={complaint.attachment_url}
              alt={complaint.attachment_name || "Complaint Photo"}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "var(--rx-radius-md)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;
