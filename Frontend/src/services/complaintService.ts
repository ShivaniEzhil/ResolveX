import api from "./api";

export interface CreateComplaintPayload {
  title: string;
  description: string;
  location: string;
}

export interface ComplaintQueryParams {
  status_filter?: string;
  priority?: string;
  category?: string;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ComplaintAssignmentPayload {
  staff_id: string;
}

export interface ComplaintStatusPayload {
  status: string;
}

export async function createComplaint(
  data: CreateComplaintPayload
) {
  const response = await api.post("/complaints/", data);
  return response.data;
}

export async function getComplaints(
  params?: ComplaintQueryParams
) {
  const response = await api.get("/complaints/", {
    params,
  });

  return response.data;
}

export async function getComplaintById(
  complaintId: string
) {
  const response = await api.get(
    `/complaints/${complaintId}`
  );

  return response.data;
}

export async function updateComplaint(
  complaintId: string,
  data: Partial<CreateComplaintPayload>
) {
  const response = await api.put(
    `/complaints/${complaintId}`,
    data
  );

  return response.data;
}

export async function deleteComplaint(
  complaintId: string
) {
  const response = await api.delete(
    `/complaints/${complaintId}`
  );

  return response.data;
}

export async function assignComplaint(
  complaintId: string,
  data: ComplaintAssignmentPayload
) {
  const response = await api.put(
    `/complaints/${complaintId}/assign`,
    data
  );

  return response.data;
}

export async function updateComplaintStatus(
  complaintId: string,
  data: ComplaintStatusPayload
) {
  const response = await api.patch(
    `/complaints/${complaintId}/status`,
    data
  );

  return response.data;
}

export async function getComplaintResponses(complaintId: string) {
  const response = await api.get(
    `/complaints/${complaintId}/responses`
  );

  return response.data;
}

export interface ComplaintResponsePayload {
  message: string;
}

export async function createComplaintResponse(
  complaintId: string,
  data: ComplaintResponsePayload
) {
  const response = await api.post(
    `/complaints/${complaintId}/responses`,
    data
  );

  return response.data;
}