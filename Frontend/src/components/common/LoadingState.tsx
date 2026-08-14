import React from "react";
import "./common.css";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading data...",
}) => {
  return (
    <div className="rx-loading-state">
      <div className="rx-spinner" />
      <p style={{ color: "var(--rx-text-secondary)", fontSize: "0.875rem" }}>
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
