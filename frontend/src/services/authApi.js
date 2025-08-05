import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const AuthApi = {
    login: (data) => {
        return axiosInstance.post("/api/v1/auth/login", data);
    },

    introspect: () => {
        return axiosInstance.get("/api/v1/auth/introspect");
    },

    logout: () => {
        return axiosInstance.post("/api/v1/auth/logout", {});
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
};

export default AuthApi;