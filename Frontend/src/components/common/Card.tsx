import React from "react";
import "./common.css";

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  footer,
  className = "",
  style,
  children,
}) => {
  return (
    <div className={`rx-card ${className}`} style={style}>
      {(title || action) && (
        <div className="rx-card-header">
          <div>
            {typeof title === "string" ? (
              <h3 className="rx-card-title">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="rx-card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="rx-card-action">{action}</div>}
        </div>
      )}
      <div className="rx-card-body">{children}</div>
      {footer && <div className="rx-card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
