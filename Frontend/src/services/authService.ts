import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
} from "../types/auth";

export const login = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials,
  );

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get<MeResponse>("/auth/me");

  return response.data.user;
};