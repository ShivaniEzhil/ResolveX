import React from "react";
import type { ComplaintItem } from "../../types/complaints";
import StatusBadge from "../common/StatusBadge";
import PriorityBadge from "../common/PriorityBadge";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import "../dashboard/dashboard.css";

interface ComplaintTableProps {
  complaints: ComplaintItem[];
  onViewDetails?: (complaint: ComplaintItem) => void;
  onAssign?: (complaint: ComplaintItem) => void;
  onUpdateStatus?: (complaint: ComplaintItem) => void;
  showActions?: boolean;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  onViewDetails,
  onAssign,
  onUpdateStatus,
  showActions = true,
}) => {
  if (complaints.length === 0) {
    return (
      <EmptyState
        title="No complaints match filters"
        description="Try adjusting your search keywords or filter dropdown selections."
      />
    );
  }

  return (
    <div className="rx-table-container">
      <table className="rx-table">
        <thead>
          <tr>
            <th>Complaint ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Department</th>
            <th>Status</th>
            <th>Assigned Staff</th>
            <th>Date</th>
            {showActions && <th style={{ textAlign: "right" }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.complaint_number}>
              <td style={{ fontFamily: "var(--rx-font-mono)", fontSize: "0.8125rem" }}>
                {c.complaint_number}
              </td>
              <td style={{ fontWeight: 600, maxWidth: 240 }}>
                <div
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.title}
                </div>
              </td>
              <td>{c.category}</td>
              <td>
                <PriorityBadge priority={c.priority} />
              </td>
              <td>{c.department}</td>
              <td>
                <StatusBadge status={c.status} />
              </td>
              <td style={{ fontSize: "0.8125rem" }}>
                {c.assignedStaffName || c.assigned_to || "-"}
              </td>
              <td style={{ color: "var(--rx-text-muted)", fontSize: "0.8125rem" }}>
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              {showActions && (
                <td style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      gap: "6px",
                      justifyContent: "flex-end",
                    }}
                  >
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(c)}
                      >
                        View
                      </Button>
                    )}
                    {onAssign && c.status !== "RESOLVED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAssign(c)}
                      >
                        {c.assigned_to ? "Reassign" : "Assign"}
                      </Button>
                    )}
                    {onUpdateStatus && c.status !== "RESOLVED" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUpdateStatus(c)}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintTable;
