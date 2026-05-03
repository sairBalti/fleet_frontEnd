import API from "../utils/api";

export const getPortalNavigation = async () => {
  const response = await API.get("/portal/navigation");
  return response.data;
};

export const getPortalIntelligence = async (businessType) => {
  const response = await API.get("/portal/intelligence", {
    params: { businessType },
  });
  return response.data;
};
