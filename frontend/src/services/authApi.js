import axiosInstance from "utils/axiosInstance";

const AuthApi = {
    login: (data) => {
        return axiosInstance.post("/api/v1/auth/login", data);
    },

    introspect: (accessToken) => {
        return axiosInstance.post("/api/v1/auth/introspect", accessToken);
    },

    logout: () => {
        return axiosInstance.post("/api/v1/auth/logout", {});
    },

    refreshAccessToken: () => {
        return axiosInstance.post("/api/v1/auth/token/refresh", {});
    },

    forgotPassword: (data) => {
        return axiosInstance.post("/api/v1/auth/forgot-password", data);
    },

    resendOTP: (data) => {
        return axiosInstance.post("/api/v1/auth/forgot-password/resend", data);
    },

    verifyOTP: (data) => {
        return axiosInstance.post("/api/v1/auth/forgot-password/verify", data);
    },

    resetPassword: (data) => {
        return axiosInstance.patch("/api/v1/auth/forgot-password/reset", data);
    }
};

export default AuthApi;