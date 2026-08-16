import React from "react";
import type { ComplaintItem } from "../../types/complaints";
import Card from "../common/Card";
import StatusBadge from "../common/StatusBadge";
import PriorityBadge from "../common/PriorityBadge";
import Button from "../common/Button";

interface ComplaintCardProps {
  complaint: ComplaintItem;
  onClick?: () => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onClick,
}) => {
  return (
    <Card className="rx-complaint-card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: "0.75rem", fontFamily: "var(--rx-font-mono)", color: "var(--rx-text-muted)" }}>
          {complaint.complaint_number}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 8, color: "var(--rx-text-primary)" }}>
        {complaint.title}
      </h4>

      <p style={{ fontSize: "0.875rem", color: "var(--rx-text-secondary)", marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {complaint.description}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--rx-border-light)", fontSize: "0.8125rem", color: "var(--rx-text-muted)" }}>
        <span>{complaint.department} • {complaint.location}</span>
        {onClick && (
          <Button variant="ghost" size="sm" onClick={onClick}>
            Details →
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ComplaintCard;
