import React from "react";
import Badge from "./Badge";

export type ComplaintPriorityType =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL"
  | string;

interface PriorityBadgeProps {
  priority: ComplaintPriorityType;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getBadgeConfig = () => {
    switch (priority.toUpperCase()) {
      case "LOW":
        return { label: "Low", variant: "default" as const };
      case "MEDIUM":
        return { label: "Medium", variant: "info" as const };
      case "HIGH":
        return { label: "High", variant: "warning" as const };
      case "CRITICAL":
        return { label: "Critical", variant: "danger" as const };
      default:
        return { label: priority, variant: "default" as const };
    }
  };

  const config = getBadgeConfig();

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default PriorityBadge;
