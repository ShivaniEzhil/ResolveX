export type NotificationType =
  | "COMPLAINT_ASSIGNED"
  | "COMPLAINT_STATUS"
  | "COMPLAINT_RESPONSE"
  | "SYSTEM"
  | string;

export interface NotificationItem {
  id: string;
  user_id: string;
  complaint_id?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}
