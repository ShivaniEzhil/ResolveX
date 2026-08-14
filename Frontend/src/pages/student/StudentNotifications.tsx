import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import NotificationList from "../../components/notifications/NotificationList";
import Card from "../../components/common/Card";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";
import type { NotificationItem } from "../../types/notifications";

interface StudentNotificationsProps {
  onNavigateTab?: (id: string) => void;
}

export const StudentNotifications: React.FC<StudentNotificationsProps> = ({
  onNavigateTab,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getNotifications();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setError("Unable to load notifications. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    try {
      await Promise.all(unread.map((n) => markNotificationAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  return (
    <DashboardLayout
      role="STUDENT"
      title="My Notifications & Updates"
      activeItem="notifications"
      onNavigate={onNavigateTab}
    >
      {isLoading ? (
        <Card title="Notifications & Alerts">
          <div style={{ padding: 40, textAlign: "center" }}>
            Loading notifications...
          </div>
        </Card>
      ) : error ? (
        <Card title="Notifications & Alerts">
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--rx-danger)",
            }}
          >
            {error}
          </div>
        </Card>
      ) : (
        <NotificationList
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}
    </DashboardLayout>
  );
};

export default StudentNotifications;
