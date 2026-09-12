import api from "./api";

export interface CreateComplaintPayload {
  title: string;
  description: string;
  location: string;
  file?: File | null;
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
  data: CreateComplaintPayload | FormData
) {
  if (data instanceof FormData) {
    const response = await api.post("/complaints/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  if (data.file) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append("file", data.file);

    const response = await api.post("/complaints/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  const response = await api.post("/complaints/", {
    title: data.title,
    description: data.description,
    location: data.location,
  });
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