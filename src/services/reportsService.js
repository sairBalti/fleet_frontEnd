import API from "../utils/api";

export const getMonthlyReports = async ({ year, month, businessType }) => {
  const response = await API.get("/reports/monthly", {
    params: {
      year,
      month,
      businessType: businessType || undefined,
    },
  });
  return response.data;
};

export const getAnnualReports = async ({ year, businessType }) => {
  const response = await API.get("/reports/annual", {
    params: {
      year,
      businessType: businessType || undefined,
    },
  });
  return response.data;
};
