import React, { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";
import NotificationList from "../../components/notifications/NotificationList";
import FilterDropdown from "../../components/common/FilterDropdown";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
import Card from "../../components/common/Card";

import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

import type { NotificationItem } from "../../types/notifications";

interface AdminNotificationsProps {
  onNavigate?: (id: string) => void;
}

export const AdminNotifications: React.FC<
  AdminNotificationsProps
> = ({ onNavigate }) => {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [filter, setFilter] = useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // Load notifications from backend
  // ============================================================

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await getNotifications();

      setNotifications(
        result.notifications || []
      );
    } catch (err) {
      console.error(
        "Failed to load admin notifications:",
        err
      );

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(
            "You do not have permission to view notifications."
          );
        } else {
          setError(
            "Unable to load notifications. Please try again."
          );
        }
      } else {
        setError(
          "Unable to load notifications. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        setError("");

        const result = await getNotifications();

        if (isMounted) {
          setNotifications(result.notifications || []);
        }
      } catch (err) {
        console.error(
          "Failed to load admin notifications:",
          err
        );

        if (isMounted) {
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 403) {
              setError(
                "You do not have permission to view notifications."
              );
            } else {
              setError(
                "Unable to load notifications. Please try again."
              );
            }
          } else {
            setError(
              "Unable to load notifications. Please try again."
            );
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // Mark single notification as read
  // ============================================================

  const handleMarkAsRead = async (
    id: string
  ) => {
    try {
      setError("");

      const result =
        await markNotificationAsRead(id);

      const updatedNotification =
        result.notification;

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
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
        if (err.response?.status === 403) {
          setError(
            "You do not have permission to update this notification."
          );
        } else if (err.response?.status === 404) {
          setError("Notification not found.");
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

  // ============================================================
  // Mark all notifications as read
  // ============================================================

  const handleMarkAllAsRead = async () => {
    const unreadNotifications =
      notifications.filter(
        (notification) =>
          !notification.is_read
      );

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      setError("");

      /*
       * The backend currently exposes an endpoint
       * for marking an individual notification as read.
       *
       * Therefore, mark each unread notification
       * through the existing API.
       */
      const results = await Promise.all(
        unreadNotifications.map(
          (notification) =>
            markNotificationAsRead(
              notification.id
            )
        )
      );

      setNotifications((previous) =>
        previous.map((notification) => {
          const updated =
            results.find(
              (result) =>
                result.notification.id ===
                notification.id
            );

          return updated
            ? updated.notification
            : notification;
        })
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(
            "You do not have permission to update notifications."
          );
        } else {
          setError(
            "Unable to mark all notifications as read. Please try again."
          );
        }
      } else {
        setError(
          "Unable to mark all notifications as read. Please try again."
        );
      }
    }
  };

  // ============================================================
  // Filter notifications
  // ============================================================

  const filteredNotifications =
    notifications.filter((notification) => {
      if (filter === "unread") {
        return !notification.is_read;
      }

      if (filter === "read") {
        return notification.is_read;
      }

      return true;
    });

  // ============================================================
  // Loading
  // ============================================================

  if (isLoading) {
    return (
      <DashboardLayout
        role="ADMIN"
        title="Notifications & Alerts"
        activeItem="notifications"
        onNavigate={onNavigate}
      >
        <LoadingState message="Loading notifications..." />
      </DashboardLayout>
    );
  }

  // ============================================================
  // Initial loading error
  // ============================================================

  if (error && notifications.length === 0) {
    return (
      <DashboardLayout
        role="ADMIN"
        title="Notifications & Alerts"
        activeItem="notifications"
        onNavigate={onNavigate}
      >
        <ErrorState
          message={error}
          onRetry={loadNotifications}
        />
      </DashboardLayout>
    );
  }

  // ============================================================
  // Main UI
  // ============================================================

  return (
    <DashboardLayout
      role="ADMIN"
      title="Notifications & Alerts"
      subtitle="System alerts, complaint assignments, and escalation messages"
      activeItem="notifications"
      onNavigate={onNavigate}
    >
      {/* API error */}
      {error && (
        <Card>
          <div
            style={{
              padding: 16,
              color: "var(--rx-danger)",
            }}
          >
            {error}
          </div>
        </Card>
      )}

      {/* Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <FilterDropdown
          label="Filter"
          value={filter}
          onChange={setFilter}
          allLabel="All Notifications"
          options={[
            {
              value: "unread",
              label: "Unread Only",
            },
            {
              value: "read",
              label: "Read Only",
            },
          ]}
        />
      </div>

      {/* Notifications */}
      <NotificationList
        notifications={filteredNotifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </DashboardLayout>
  );
};

export default AdminNotifications;