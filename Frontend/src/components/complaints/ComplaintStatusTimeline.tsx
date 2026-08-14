import React from "react";
import type { ComplaintStatusType } from "../common/StatusBadge";
import "./complaints.css";

interface ComplaintStatusTimelineProps {
  status: ComplaintStatusType;
  createdAt: string;
  updatedAt?: string;
  hasAIAnalysis?: boolean;
}

const STAGES = [
  { key: "SUBMITTED", title: "Complaint Submitted" },
  { key: "AI_CLASSIFIED", title: "AI Analysis Completed" },
  { key: "ASSIGNED", title: "Assigned to Staff" },
  { key: "IN_PROGRESS", title: "Resolution In Progress" },
  { key: "RESOLVED", title: "Complaint Resolved" },
];

export const ComplaintStatusTimeline: React.FC<ComplaintStatusTimelineProps> = ({
  status,
  createdAt,
  updatedAt,
  hasAIAnalysis = true,
}) => {
  const getStageState = (stageKey: string) => {
    const current = status.toUpperCase();

    if (stageKey === "SUBMITTED") return "completed";

    if (stageKey === "AI_CLASSIFIED") {
      return hasAIAnalysis ? "completed" : "pending";
    }

    if (stageKey === "ASSIGNED") {
      if (["ASSIGNED", "IN_PROGRESS", "RESOLVED"].includes(current)) {
        return current === "ASSIGNED" ? "active" : "completed";
      }
      return "pending";
    }

    if (stageKey === "IN_PROGRESS") {
      if (["IN_PROGRESS", "RESOLVED"].includes(current)) {
        return current === "IN_PROGRESS" ? "active" : "completed";
      }
      return "pending";
    }

    if (stageKey === "RESOLVED") {
      return current === "RESOLVED" ? "completed" : "pending";
    }

    return "pending";
  };

  return (
    <div className="rx-timeline">
      {STAGES.map((stage) => {
        const state = getStageState(stage.key);
        return (
          <div key={stage.key} className="rx-timeline-item">
            <div
              className={`rx-timeline-node ${
                state === "active"
                  ? "rx-timeline-node--active"
                  : state === "completed"
                  ? "rx-timeline-node--completed"
                  : ""
              }`}
            />
            <div className="rx-timeline-title">{stage.title}</div>
            <div className="rx-timeline-date">
              {state === "completed" || state === "active"
                ? stage.key === "SUBMITTED"
                  ? new Date(createdAt).toLocaleString()
                  : updatedAt
                  ? new Date(updatedAt).toLocaleString()
                  : "Completed"
                : "Pending"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintStatusTimeline;
