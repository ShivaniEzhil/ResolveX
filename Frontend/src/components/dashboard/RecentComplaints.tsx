import React from "react";
import type { Complaint } from "../../types/analytics";
import Card from "../common/Card";
import StatusBadge from "../common/StatusBadge";
import PriorityBadge from "../common/PriorityBadge";
import EmptyState from "../common/EmptyState";
import "./dashboard.css";

interface RecentComplaintsProps {
  complaints: Complaint[];
  title?: string;
  onViewAll?: () => void;
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const RecentComplaints: React.FC<RecentComplaintsProps> = ({
  complaints,
  title = "Recent Complaints",
  onViewAll,
  onSelectComplaint,
}) => {
  return (
    <Card
      title={title}
      action={
        onViewAll ? (
          <button
            onClick={onViewAll}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--rx-primary)",
              fontWeight: 500,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            View all →
          </button>
        ) : undefined
      }
    >
      {complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="There are no recent complaints to display."
        />
      ) : (
        <div className="rx-table-container">
          <table className="rx-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Department</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr
                  key={complaint.id}
                  onClick={() => onSelectComplaint && onSelectComplaint(complaint)}
                  style={{ cursor: onSelectComplaint ? "pointer" : "default" }}
                >
                  <td style={{ fontWeight: 500, maxWidth: 220 }}>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {complaint.title}
                    </div>
                  </td>
                  <td>{complaint.category}</td>
                  <td>
                    <PriorityBadge priority={complaint.priority} />
                  </td>
                  <td>{complaint.department}</td>
                  <td>
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td style={{ color: "var(--rx-text-muted)", fontSize: "0.8125rem" }}>
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default RecentComplaints;
