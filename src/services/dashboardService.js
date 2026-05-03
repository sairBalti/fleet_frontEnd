import API from "../utils/api";

export const getDashboardKpis = async (params = {}) => {
  const response = await API.get("/portal/dashboard-kpis", { params });
  return response.data;
};
