import api from "./api";
import type { NotificationItem } from "../types/notifications";

export interface GetNotificationsResponse {
  count: number;
  notifications: NotificationItem[];
}

export interface MarkNotificationReadResponse {
  message: string;
  notification: NotificationItem;
}

export async function getNotifications(): Promise<GetNotificationsResponse> {
  const response = await api.get<GetNotificationsResponse>("/notifications/");
  return response.data;
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<MarkNotificationReadResponse> {
  const response = await api.patch<MarkNotificationReadResponse>(
    `/notifications/${notificationId}/read`
  );
  return response.data;
}
