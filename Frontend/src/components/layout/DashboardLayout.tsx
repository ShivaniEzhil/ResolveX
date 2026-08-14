import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { UserRole } from "../../types/auth";
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
  unreadNotificationsCount = 0,
  onNotificationClick,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          unreadNotificationsCount={unreadNotificationsCount}
          onNotificationClick={onNotificationClick}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="rx-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
