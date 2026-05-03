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

export const createBranchAI = async ({ message, data }) => {
    const hasFile = !!data?.file;

    let payload;
    let config = {};

    if (hasFile) {
        payload = new FormData();
        payload.append("message", message || "");
        if (data?.company_id) payload.append("company_id", data.company_id);
        payload.append("file", data.file);
        config = {
            headers: { "Content-Type": "multipart/form-data" }
        };
    } else {
        payload = data
            ? {
                action: data.action,
                company_id: data.company_id,
                branch_name: data.branch_name,
                branch_location: data.branch_location
            }
            : { message };
    }

    const res = await API.post("/companies/branch/ingest", payload, config);
    return res.data;
};

export const previewBranchAI = async ({ message }) => {
    const res = await API.post("/companies/branch/preview", { message });
    return res.data;
};

export const getDemoRequests = async (params) => {
    const res = await API.post("/demo-requests/targets", params);
    return res.data;
};