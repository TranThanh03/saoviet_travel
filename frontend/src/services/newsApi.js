import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const NewsApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/news", { params });
    },
    getById: (id) => {
        return axiosInstance.get(`/api/v1/news/${id}`);
    },
    getByIdAndAdmin: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/news/detail/${id}`);
    },
    create: (data) => {
        return axiosInstanceAdmin.post("/api/v1/news", data);
    },
    update: (id, data) => {
        return axiosInstanceAdmin.put(`/api/v1/news/${id}`, data);
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
        return axiosInstance.get(`/api/v1/news/list-outstanding/${id}`);
    },
    getTopNewList: (id) => {
        return axiosInstance.get(`/api/v1/news/list-top-new/${id}`);
    }
};

export default NewsApi;