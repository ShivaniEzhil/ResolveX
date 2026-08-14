import React from "react";
import Badge from "./Badge";

export type ComplaintStatusType =
  | "SUBMITTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | string;

interface StatusBadgeProps {
  status: ComplaintStatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status.toUpperCase()) {
      case "SUBMITTED":
        return { label: "Submitted", variant: "info" as const };
      case "ASSIGNED":
        return { label: "Assigned", variant: "warning" as const };
      case "IN_PROGRESS":
        return { label: "In Progress", variant: "primary" as const };
      case "RESOLVED":
        return { label: "Resolved", variant: "success" as const };
      default:
        return { label: status, variant: "default" as const };
    }
  };

  const config = getBadgeConfig();

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default StatusBadge;
