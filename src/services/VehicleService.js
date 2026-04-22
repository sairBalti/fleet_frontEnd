
import API from "../utils/api";
// GET: All vehicles
// export const getVehiclesList = async () => {
//     const response = await API.get("/Allvehicles");
//     return response.data;
//   };
  
  // DELETE: Single vehicle by ID
  export const deleteVehicleById = async (id) => {
    const response = await API.delete(`/Deletevehicles/${id}`);
    return response.data;
  };
  
  // DELETE: Bulk vehicles by IDs
  export const deleteMultipleVehicles = async (ids) => {
    const response = await API.post("/vehicles/delete-multiple", { ids });
    return response.data;
  };
  
  // PUT: Update a vehicle by ID
  export const updateVehicleById = async (id, updatedData) => {
    const response = await API.put(`/Updatevehicles/${id}`, updatedData);
    return response.data;
  };
  // Post: Add Vehicle
 export const addvehicles = async (vehicleData) => {
  const response = await API.post("/Addvehicles", vehicleData);
  return response.data;
};
  export const getVehicleById = async (id) => {
  const response = await API.get(`/vehicles/${id}`);
  return response.data;
};

export const getVehiclesList = async (params) => {
    const response = await API.post("/vehicle/vehiclePaging", params); // or appropriate endpoint
    return response.data;
};
export const getFleetOverview = async (params) => {
    const response = await API.post("/overview",params); // or appropriate endpoint
    return response.data;
};
  
export const getVehicleInspection = async () => {
  const response = await API.get('/inspection_list');
  return response.data;
};

export const insertInspection = async (data) => {
  return await API.post('/Addinspections', data);
};