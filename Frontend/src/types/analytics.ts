export interface ComplaintSummary {
  total: number;
  submitted: number;
  assigned: number;
  in_progress: number;
  resolved: number;
}

export interface ComplaintStatistics {
  summary: ComplaintSummary;
  by_priority: Record<string, number>;
  by_department: Record<string, number>;
  by_category: Record<string, number>;
}

export interface StaffWorkload {
  staff_id: string;
  name: string;
  department: string | null;
  assigned: number;
  in_progress: number;
  resolved: number;
  active_workload: number;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  priority: string;
  category: string;
  department: string;
  user_id: string;
  assigned_to?: string;
  ai_summary?: string;
  ai_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditActivity {
  id: string;
  user_id?: string;
  complaint_id?: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}