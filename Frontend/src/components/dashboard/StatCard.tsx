import React from "react";
import "./dashboard.css";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trendLabel?: string;
  trendDirection?: "up" | "down" | "neutral";
  iconBg?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trendLabel,
  trendDirection = "neutral",
  iconBg,
  iconColor,
}) => {
  return (
    <div className="rx-stat-card">
      <div className="rx-stat-header">
        <span className="rx-stat-label">{label}</span>
        {icon && (
          <div
            className="rx-stat-icon"
            style={{
              backgroundColor: iconBg || "var(--rx-gray-100)",
              color: iconColor || "var(--rx-gray-600)",
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="rx-stat-value">{value}</div>
        {trendLabel && (
          <div className={`rx-stat-trend rx-stat-trend--${trendDirection}`}>
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
