import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import NotificationList from "../../components/notifications/NotificationList";
import { MOCK_NOTIFICATIONS } from "../../data/mockData";
import type { NotificationItem } from "../../types/notifications";

interface StudentNotificationsProps {
  onNavigateTab?: (id: string) => void;
}

export const StudentNotifications: React.FC<StudentNotificationsProps> = ({
  onNavigateTab,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <DashboardLayout
      role="STUDENT"
      title="My Notifications & Updates"
      activeItem="notifications"
      onNavigate={onNavigateTab}
    >
      <NotificationList
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </DashboardLayout>
  );
};

export default StudentNotifications;
