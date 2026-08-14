import React from "react";
import "./common.css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      className={`rx-btn rx-btn--${variant} rx-btn--${size} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          className="rx-spinner"
          style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }}
        />
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
