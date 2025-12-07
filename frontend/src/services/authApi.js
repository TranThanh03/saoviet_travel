import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

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

    loginAdmin: (data) => {
        return axiosInstanceAdmin.post("/api/v1/auth/admin/login", data);
    },

    introspectAdmin: () => {
        return axiosInstanceAdmin.get("/api/v1/auth/admin/introspect");
    },
    
    logoutAdmin: () => {
        return axiosInstanceAdmin.post("/api/v1/auth/admin/logout", {});
    },

    refreshAccessTokenAdmin: () => {
        return axiosInstanceAdmin.post("/api/v1/auth/admin/token/refresh", {});
    },
};

export default AuthApi;