import api from "./api";
import type { UserManagementItem } from "../types/users";
import type { UserRole } from "../types/auth";

export interface GetUsersResponse {
  count: number;
  users: UserManagementItem[];
}

export interface UserMutationResponse {
  message: string;
  user: UserManagementItem;
}

export async function getUsers(): Promise<GetUsersResponse> {
  const response = await api.get<GetUsersResponse>("/users/");
  return response.data;
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<UserMutationResponse> {
  const response = await api.put<UserMutationResponse>(
    `/users/${userId}/role`,
    { role }
  );

  return response.data;
}

export async function updateUserStatus(
  userId: string,
  isActive: boolean
): Promise<UserMutationResponse> {
  const response = await api.put<UserMutationResponse>(
    `/users/${userId}/status`,
    { is_active: isActive }
  );

  return response.data;
}

export async function updateUserDepartment(
  userId: string,
  department: string
): Promise<UserMutationResponse> {
  const response = await api.put<UserMutationResponse>(
    `/users/${userId}/department`,
    { department }
  );

  return response.data;
}