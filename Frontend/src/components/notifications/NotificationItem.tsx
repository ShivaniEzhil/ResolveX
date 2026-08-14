import React from "react";
import type { NotificationItem as NotificationItemType } from "../../types/notifications";
import "./notifications.css";

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  return (
    <div
      className={`rx-notif-item ${
        !notification.is_read ? "rx-notif-item--unread" : ""
      }`}
      onClick={() =>
        !notification.is_read && onMarkAsRead && onMarkAsRead(notification.id)
      }
      style={{ cursor: !notification.is_read ? "pointer" : "default" }}
    >
      <div className="rx-notif-icon">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div className="rx-notif-content">
        <div className="rx-notif-title">{notification.title}</div>
        <div className="rx-notif-msg">{notification.message}</div>
        <div className="rx-notif-time">
          {new Date(notification.created_at).toLocaleString()}
        </div>
      </div>

      {!notification.is_read && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--rx-primary)",
            flexShrink: 0,
            marginTop: 6,
          }}
        />
      )}
    </div>
  );
};

export default NotificationItemComponent;
