import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { UserRole } from "../../types/auth";
import { getNotifications } from "../../services/notificationService";
import "./layout.css";

interface DashboardLayoutProps {
  role: UserRole;
  title: string;
  subtitle?: string;
  activeItem?: string;
  onNavigate?: (id: string) => void;
  unreadNotificationsCount?: number;
  onNotificationClick?: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  role,
  title,
  subtitle,
  activeItem = "dashboard",
  onNavigate,
  unreadNotificationsCount,
  onNotificationClick,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadNotifications = async () => {
      try {
        const result = await getNotifications();

        const count = (result.notifications || []).filter(
          (notification) => !notification.is_read
        ).length;

        setUnreadCount(count);
      } catch (error) {
        console.error(
          "Failed to load notification count:",
          error
        );
      }
    };

    // API request intentionally updates component state.
    loadUnreadNotifications();
  }, []);

  const notificationCount =
    unreadNotificationsCount !== undefined
      ? unreadNotificationsCount
      : unreadCount;

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
      return;
    }

    onNavigate?.("notifications");
  };

  return (
    <div className="rx-layout">
      <Sidebar
        role={role}
        activeItem={activeItem}
        onNavigate={onNavigate}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="rx-main">
        <Header
          title={title}
          subtitle={subtitle}
          unreadNotificationsCount={notificationCount}
          onNotificationClick={handleNotificationClick}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="rx-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;