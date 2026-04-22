import { jwtDecode } from "jwt-decode";

export const getUserRole = () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return null;

    try {
        const decode = jwtDecode(token);
        return decode.role || null;
    } catch (error) {
        console.error("invalid token", error);
        return null
    }
};

export const getUserData = () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return null;

    try {
        const decode = jwtDecode(token);
        return {
            user_id: decode.user_id,
            role: decode.role,
            role_id: decode.role_id,
            company_id: decode.company_id,
            branch_id: decode.branch_id
        };
    } catch (error) {
        console.error("invalid token", error);
        return null
    }
};
