
import API from "../utils/api";

// DELETE: Single vehicle by ID
export const deleteVehicleById = async (id) => {
  const response = await API.delete(`/vehicle/${id}`);
  return response.data;
};

// DELETE: Bulk vehicles by IDs
export const deleteMultipleVehicles = async (ids) => {
  const response = await API.post("/vehicle/delete-multiple", { ids });
  return response.data;
};

// PUT: Update a vehicle by ID
export const updateVehicleById = async (id, updatedData) => {
  const response = await API.put(`/vehicle/${id}`, updatedData);
  return response.data;
};

// POST: Add Vehicle
export const addvehicles = async (vehicleData) => {
  const response = await API.post("/vehicle", vehicleData);
  return response.data;
};

export const getVehicleById = async (id) => {
  const response = await API.get(`/vehicle/${id}`);
  return response.data;
};

export const getVehiclesList = async (params) => {
  const response = await API.post("/vehicle/vehiclePaging", params);
  return response.data;
};
export const getFleetOverview = async (params) => {
  const response = await API.post("/overview", params); // unchanged existing contract
  return response.data;
};

export const getVehicleInspection = async () => {
  const response = await API.get('/inspection_list');
  return response.data;
};

export const insertInspection = async (data) => {
  return await API.post('/Addinspections', data);
};

export const createVehicleAI = async ({ message, file }) => {
  const payload = new FormData();
  payload.append("message", message || "");
  if (file) payload.append("file", file);
  const response = await API.post("/vehicle/ingest", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};