import type { UserRole } from "./auth";

export interface UserManagementItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  department?: string | null;
  created_at: string;
}

export interface UserFilterState {
  search: string;
  role: string;
  status: string;
  department: string;
}
