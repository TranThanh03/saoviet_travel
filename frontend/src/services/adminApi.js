import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const AdminApi = {
    login: (data) => {
        return axiosInstanceAdmin.post("/api/v1/admin/auth/login", data);
    },
    
    logout: () => {
        return axiosInstanceAdmin.post("/api/v1/admin/auth/logout", {});
    },

    refreshAccessToken: () => {
        return axiosInstanceAdmin.post("/api/v1/admin/auth/token/refresh", {});
    },

    info: () => {
        return axiosInstanceAdmin.get("/api/v1/admin/info");
    },

    update: (data) => {
        return axiosInstanceAdmin.patch(`/api/v1/admin`, data);
    },

    changePassword: (data) => {
        return axiosInstanceAdmin.patch(`/api/v1/admin/change-password`, data);
    },

    forgotPassword: (data) => {
        return axiosInstanceAdmin.post("/api/v1/admin/auth/forgot-password", data);
    },

    resendOTP: (data) => {
        return axiosInstanceAdmin.post("/api/v1/admin/auth/forgot-password/resend", data);
    },

    verifyOTP: (data) => {
        return axiosInstanceAdmin.post("/api/v1/admin/auth/forgot-password/verify", data);
    },

    resetPassword: (data) => {
        return axiosInstanceAdmin.patch("/api/v1/admin/auth/forgot-password/reset", data);
    }
};

export default AdminApi;