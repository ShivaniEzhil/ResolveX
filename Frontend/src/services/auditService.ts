import api from "./api";
import type { AuditActivity } from "../types/analytics";

export interface GetAuditLogsResponse {
  count: number;
  audit_logs: AuditActivity[];
}

export async function getAuditLogs(): Promise<GetAuditLogsResponse> {
  const response = await api.get<GetAuditLogsResponse>(
    "/audit/"
  );

  return response.data;
}

export async function getComplaintAuditLogs(
  complaintId: string
): Promise<GetAuditLogsResponse> {
  const response = await api.get<GetAuditLogsResponse>(
    `/audit/complaints/${complaintId}`
  );

  return response.data;
}