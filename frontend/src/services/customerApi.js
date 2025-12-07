import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const CustomerApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/customers", { params });
    },

    getById: (id) => {
        return axiosInstance.get(`/api/v1/customers/${id}`);
    },

    info: () => {
        return axiosInstance.get("/api/v1/customers/info");
    },

    create: (data) => {
        return axiosInstance.post("/api/v1/customers", data);
    },

    update: (data) => {
        return axiosInstance.patch(`/api/v1/customers`, data);
    },

    changePassword: (data) => {
        return axiosInstance.patch(`/api/v1/customers/change-password`, data);
    },

    activate: (id) => {
        return axiosInstance.patch(`/api/v1/customers/${id}/activate`);
    },

    activateByAdmin: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/customers/${id}/activate`);
    },

    unlock: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/customers/${id}/unlock`, {});
    },

    lock: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/customers/${id}/lock`, {});
    },

    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/customers/${id}`);
    }
};

export default CustomerApi;