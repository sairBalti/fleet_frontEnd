import API from "../utils/api";

export const getDriverScheduleData = async (payload) => {
  const response = await API.post("/drivers/schedule", payload);
  return response.data;
};

export const getDriverPerformanceData = async (params) => {
  const response = await API.get("/drivers/performance", { params });
  return response.data;
};

export const getDriversList = async (payload) => {
  const response = await API.post("/drivers/list", payload);
  return response.data;
};

export const getDriverById = async (id) => {
  const response = await API.get(`/drivers/profile/${id}`);
  return response.data;
};

export const createDriver = async (payload) => {
  const response = await API.post("/drivers", payload);
  return response.data;
};

export const updateDriver = async (id, payload) => {
  const response = await API.put(`/drivers/profile/${id}`, payload);
  return response.data;
};

export const patchDriverStatus = async (id, status) => {
  const response = await API.patch(`/drivers/profile/${id}/status`, { status });
  return response.data;
};

export const deleteDriverById = async (id) => {
  const response = await API.delete(`/drivers/profile/${id}`);
  return response.data;
};

export const previewDriverScheduleAi = async ({ message, companyId, branchId, file }) => {
  if (file) {
    const fd = new FormData();
    fd.append("companyId", String(companyId));
    fd.append("branchId", String(branchId));
    if (message) fd.append("message", message);
    fd.append("file", file);
    const response = await API.post("/drivers/schedule-ai/preview", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
  const response = await API.post("/drivers/schedule-ai/preview", {
    message,
    companyId,
    branchId,
  });
  return response.data;
};

export const commitDriverScheduleAi = async (payload) => {
  const response = await API.post("/drivers/schedule-ai/commit", payload);
  return response.data;
};
