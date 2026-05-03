import API from "../utils/api";

export const getCompanyBranchLookup = async ({ companyId = null, returnCompanyData = true, returnBranchData = true } = {}) => {
  const response = await API.post("/lookup/getCompanyBranchLookup", {
    companyId,
    returnCompanyData,
    returnBranchData,
  });
  return response.data;
};
