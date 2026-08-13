import api from "./api";

import type {
  ComplaintStatistics,
  StaffWorkload,
  Complaint,
  AuditActivity,
} from "../types/analytics";

export const getComplaintStatistics =
  async (): Promise<ComplaintStatistics> => {
    const response = await api.get<ComplaintStatistics>(
      "/analytics/complaints",
    );

    return response.data;
  };

export const getStaffWorkload =
  async (): Promise<StaffWorkload[]> => {
    const response = await api.get<{
      staff_workload: StaffWorkload[];
    }>("/analytics/staff-workload");

    return response.data.staff_workload;
  };

export const getRecentComplaints =
  async (limit = 10): Promise<Complaint[]> => {
    const response = await api.get<{
      complaints: Complaint[];
    }>("/analytics/recent-complaints", {
      params: { limit },
    });

    return response.data.complaints;
  };

export const getRecentActivity =
  async (limit = 10): Promise<AuditActivity[]> => {
    const response = await api.get<{
      activity: AuditActivity[];
    }>("/analytics/recent-activity", {
      params: { limit },
    });

    return response.data.activity;
  };