import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import NotificationList from "../../components/notifications/NotificationList";
import FilterDropdown from "../../components/common/FilterDropdown";
import { MOCK_NOTIFICATIONS } from "../../data/mockData";
import type { NotificationItem } from "../../types/notifications";

interface AdminNotificationsProps {
  onNavigate?: (id: string) => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState("");

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  return (
    <DashboardLayout
      role="ADMIN"
      title="Notifications & Alerts"
      subtitle="System alerts, complaint assignments, and escalation messages"
      activeItem="notifications"
      onNavigate={onNavigate}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <FilterDropdown
          label="Filter"
          value={filter}
          onChange={setFilter}
          allLabel="All Notifications"
          options={[
            { value: "unread", label: "Unread Only" },
            { value: "read", label: "Read Only" },
          ]}
        />
      </div>

      <NotificationList
        notifications={filtered}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </DashboardLayout>
  );
};

export default AdminNotifications;
