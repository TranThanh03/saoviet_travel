import axiosInstance from "utils/axiosInstance.js";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin.js";
import getToken from "utils/getToken.js";

const AuthApi = {
    login: (data) => {
        return axiosInstance.post("/api/v1/auth/login", data);
    },

    introspect: () => {
        return axiosInstance.get("/api/v1/auth/introspect", {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    logout: () => {
        return axiosInstance.post("/api/v1/auth/logout", {}, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },

    loginAdmin: (data) => {
        return axiosInstanceAdmin.post("/api/v1/auth/admin/login", data);
    },

    introspectAdmin: () => {
        return axiosInstanceAdmin.get("/api/v1/auth/admin/introspect", {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    
    logoutAdmin: () => {
        return axiosInstanceAdmin.post("/api/v1/auth/admin/logout", {}, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
};

export default AuthApi;