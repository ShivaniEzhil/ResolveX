import React from "react";
import { useAuth } from "../../context/useAuth";
import "./layout.css";

interface HeaderProps {
  title: string;
  subtitle?: string;
  unreadNotificationsCount?: number;
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  unreadNotificationsCount = 0,
  onNotificationClick,
  onMenuClick,
}) => {
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="rx-header">
      <div className="rx-header-left">
        <button
          className="rx-header-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div>
          <h1 className="rx-header-title">{title}</h1>
          {subtitle ? (
            <p className="rx-header-subtitle">{subtitle}</p>
          ) : user ? (
            <p className="rx-header-subtitle">Welcome back, {user.name}</p>
          ) : null}
        </div>
      </div>

      <div className="rx-header-right">
        <button
          className="rx-header-notification-btn"
          onClick={onNotificationClick}
          aria-label="Notifications"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadNotificationsCount > 0 && (
            <span className="rx-header-notification-badge">
              {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
            </span>
          )}
        </button>

        {user && (
          <div className="rx-header-user">
            <div className="rx-header-avatar">{getInitials(user.name)}</div>
            <div className="rx-header-user-info">
              <span className="rx-header-user-name">{user.name}</span>
              <span className="rx-header-user-role">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
