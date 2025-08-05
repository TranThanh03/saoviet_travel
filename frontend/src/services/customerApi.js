import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const CustomerApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/customers", { params });
    },
    getById: (id) => {
        return axiosInstance.get(`/api/v1/customers/${id}`);
    },
    infor: () => {
        return axiosInstance.get("/api/v1/customers/infor");
    },
    create: (data) => {
        return axiosInstance.post("/api/v1/customers", data);
    },
    update: (data) => {
        return axiosInstance.put(`/api/v1/customers`, data);
    },
    changePassword: (data) => {
        return axiosInstance.put(`/api/v1/customers/password`, data);
    },
    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/customers/${id}`);
    },
    activate: (id) => {
        return axiosInstance.patch(`/api/v1/customers/activate/${id}`);
    },
    lock: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/customers/lock/${id}`, {});
    },
    unlock: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/customers/unlock/${id}`, {});
    },
};

export default CustomerApi;