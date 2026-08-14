import React from "react";
import type { NotificationItem as NotificationItemType } from "../../types/notifications";
import NotificationItemComponent from "./NotificationItem";
import EmptyState from "../common/EmptyState";
import Card from "../common/Card";
import "./notifications.css";

interface NotificationListProps {
  notifications: NotificationItemType[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Card
      title="Notifications & Alerts"
      action={
        unreadCount > 0 && onMarkAllAsRead ? (
          <button
            onClick={onMarkAllAsRead}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--rx-primary)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Mark all as read
          </button>
        ) : undefined
      }
    >
      {notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up!"
          description="There are no notifications or system alerts at this time."
        />
      ) : (
        <div className="rx-notif-list">
          {notifications.map((notif) => (
            <NotificationItemComponent
              key={notif.id}
              notification={notif}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default NotificationList;
