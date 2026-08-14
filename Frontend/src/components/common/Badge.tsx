import React from "react";
import "./common.css";

export interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className = "",
  children,
}) => {
  return (
    <span className={`rx-badge rx-badge--${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
