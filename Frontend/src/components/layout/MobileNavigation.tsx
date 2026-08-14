import React from "react";
import type { UserRole } from "../../types/auth";
import "./layout.css";

interface MobileNavProps {
  role: UserRole;
  activeItem?: string;
  onNavigate: (id: string) => void;
}

export const MobileNavigation: React.FC<MobileNavProps> = ({
  role,
  activeItem = "dashboard",
  onNavigate,
}) => {
  const getItems = () => {
    switch (role) {
      case "ADMIN":
        return [
          { id: "dashboard", label: "Dashboard" },
          { id: "complaints", label: "Complaints" },
          { id: "users", label: "Users" },
          { id: "notifications", label: "Alerts" },
        ];
      case "STAFF":
        return [
          { id: "dashboard", label: "Dashboard" },
          { id: "complaints", label: "Assigned" },
          { id: "notifications", label: "Alerts" },
        ];
      case "STUDENT":
        return [
          { id: "dashboard", label: "Dashboard" },
          { id: "submit-complaint", label: "Submit" },
          { id: "my-complaints", label: "My List" },
          { id: "notifications", label: "Alerts" },
        ];
      default:
        return [];
    }
  };

  const items = getItems();

  return (
    <nav className="rx-mobile-nav" style={{
      display: 'none',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--rx-surface)',
      borderTop: '1px solid var(--rx-border)',
      padding: '8px 16px',
      zIndex: 'var(--rx-z-sticky)',
      justifyContent: 'space-around'
    }}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`rx-mobile-nav-btn ${
            activeItem === item.id ? "active" : ""
          }`}
          onClick={() => onNavigate(item.id)}
          style={{
            border: 'none',
            background: 'transparent',
            color: activeItem === item.id ? 'var(--rx-primary)' : 'var(--rx-text-secondary)',
            fontSize: '0.75rem',
            fontWeight: activeItem === item.id ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default MobileNavigation;
