import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import NotificationList from "../../components/notifications/NotificationList";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";
import type { NotificationItem } from "../../types/notifications";

interface StaffNotificationsProps {
  onNavigateTab?: (id: string) => void;
}

export const StaffNotifications: React.FC<
  StaffNotificationsProps
> = ({ onNavigateTab }) => {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getNotifications();

        setNotifications(
          result.notifications || []
        );
      } catch (err) {
        console.error(
          "Failed to load notifications:",
          err
        );

        setError(
          "Unable to load notifications. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      setError("");

      const result =
        await markNotificationAsRead(id);

      const updatedNotification =
        result.notification;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id ===
          updatedNotification.id
            ? updatedNotification
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError(
            "Notification not found."
          );
        } else if (err.response?.status === 403) {
          setError(
            "You do not have permission to update this notification."
          );
        } else {
          setError(
            "Unable to mark notification as read. Please try again."
          );
        }
      } else {
        setError(
          "Unable to mark notification as read. Please try again."
        );
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications =
      notifications.filter(
        (notification) =>
          !notification.is_read
      );

    try {
      setError("");

      await Promise.all(
        unreadNotifications.map(
          (notification) =>
            markNotificationAsRead(
              notification.id
            )
        )
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );

      setError(
        "Unable to mark all notifications as read. Please try again."
      );

      // Reload from backend so the UI reflects
      // the actual persisted state.
      try {
        const result =
          await getNotifications();

        setNotifications(
          result.notifications || []
        );
      } catch (reloadError) {
        console.error(
          "Failed to reload notifications:",
          reloadError
        );
      }
    }
  };

  return (
    <DashboardLayout
      role="STAFF"
      title="Staff Notifications & Assignment Alerts"
      activeItem="notifications"
      onNavigate={onNavigateTab}
    >
      {isLoading ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
          }}
        >
          Loading notifications...
        </div>
      ) : error ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "var(--rx-danger)",
          }}
        >
          {error}
        </div>
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

export default StaffNotifications;