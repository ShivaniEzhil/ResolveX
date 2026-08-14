import React from "react";
import type { AuditActivity } from "../../types/analytics";
import Card from "../common/Card";
import EmptyState from "../common/EmptyState";
import "./dashboard.css";

interface RecentActivityProps {
  activity: AuditActivity[];
  title?: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activity,
  title = "Recent System Activity",
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " - " + d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <Card title={title}>
      {activity.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="System actions and audit logs will appear here."
        />
      ) : (
        <ul className="rx-activity-list">
          {activity.map((item) => (
            <li key={item.id} className="rx-activity-item">
              <div className="rx-activity-dot" />
              <div className="rx-activity-content">
                <div className="rx-activity-action">{item.action}</div>
                <div className="rx-activity-desc">{item.description}</div>
                <div className="rx-activity-time">{formatDate(item.created_at)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default RecentActivity;
