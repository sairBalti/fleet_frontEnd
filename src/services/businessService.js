import API from "../utils/api"

export const getCompanyList = async (params) => {
    const response = await API.post("/companies/live", params);
    return response.data;
}
export const createCompanyAI = async ({ message, file, data }) => {
    try {
        const formData = new FormData();

        formData.append("message", message || "");
        if (file) formData.append("file", file);
        if (data) {
            formData.append("company_name", data.company_name);
            formData.append("business_type", data.business_type);
            formData.append("number_of_branches", data.number_of_branches || 0);
            formData.append("total_admins", data.total_admins || 0);
        }

        const res = await API.post("/companies/ingest", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return res.data;

    } catch (error) {
        throw error; // keep full axios error
    }
};
export const previewCompanyAI = async ({ message }) => {
    const formData = new FormData();

    formData.append("message", message);
    const res = await API.post("/companies/preview", formData);
    return res.data;
};

export const getBranchList = async (params) => {
    const res = await API.post("/companies/branchList", params);
    return res.data;
};