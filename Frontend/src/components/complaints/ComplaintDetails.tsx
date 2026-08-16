import React from "react";
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
            {onUpdateStatusClick && complaint.status !== "RESOLVED" && (
              <button
                className="rx-btn rx-btn--primary rx-btn--sm"
                onClick={onUpdateStatusClick}
              >
                Update Status
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
    </div>
  );
};

export default ComplaintDetails;
