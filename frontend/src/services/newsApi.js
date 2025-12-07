import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const NewsApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/news", { params });
    },

    getById: (id) => {
        return axiosInstance.get(`/api/v1/news/${id}`);
    },

    getDetailByAdmin: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/news/${id}/detail`);
    },

    create: (data) => {
        return axiosInstanceAdmin.post("/api/v1/news", data);
    },

    update: (id, data) => {
        return axiosInstanceAdmin.patch(`/api/v1/news/${id}`, data);
    },

    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/news/${id}`);
    },

    getOutstanding: () => {
        return axiosInstance.get("/api/v1/news/outstanding");
    },

    getTopNew: () => {
        return axiosInstance.get("/api/v1/news/top-new");
    },

    getOutstandingList: (id) => {
        return axiosInstance.get(`/api/v1/news/${id}/list-outstanding`);
    },

    getTopNewList: (id) => {
        return axiosInstance.get(`/api/v1/news/${id}/list-top-new`);
    }
};

export default NewsApi;