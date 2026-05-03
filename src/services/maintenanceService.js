import API from "../utils/api";

export const listMaintenanceWorkOrders = async (params) => {
  const response = await API.get("/maintenance/work-orders", { params });
  return response.data;
};

export const getMaintenanceVehicleOptions = async (params) => {
  const response = await API.get("/maintenance/vehicles", { params });
  return response.data;
};

export const getWorkOrderById = async (id) => {
  const response = await API.get(`/maintenance/work-orders/${id}`);
  return response.data;
};

export const createWorkOrder = async (payload) => {
  const response = await API.post("/maintenance/work-orders", payload);
  return response.data;
};

export const updateWorkOrder = async (id, payload) => {
  const response = await API.put(`/maintenance/work-orders/${id}`, payload);
  return response.data;
};

export const patchWorkOrderStatus = async (id, status) => {
  const response = await API.patch(`/maintenance/work-orders/${id}/status`, { status });
  return response.data;
};
