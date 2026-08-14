import type { ComplaintStatusType } from "../components/common/StatusBadge";
import type { ComplaintPriorityType } from "../components/common/PriorityBadge";

export interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: ComplaintPriorityType;
  department: string;
  status: ComplaintStatusType;
  user_id: string;
  userName?: string;
  userEmail?: string;
  assigned_to?: string;
  assignedStaffName?: string;
  ai_summary?: string;
  ai_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintFilterState {
  search: string;
  status: string;
  priority: string;
  department: string;
  category: string;
}

export interface ComplaintResponseItem {
  id: string;
  complaint_id: string;
  user_id: string;
  userName: string;
  userRole: "ADMIN" | "STAFF" | "STUDENT";
  message: string;
  created_at: string;
}
