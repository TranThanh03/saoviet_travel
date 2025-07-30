import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";
import getToken from "utils/getToken";

const NewsApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/news",  {
            params,
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    getById: (id) => {
        return axiosInstance.get(`/api/v1/news/${id}`);
    },
    getByIdAndAdmin: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/news/detail/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    create: (data) => {
        return axiosInstanceAdmin.post("/api/v1/news", data, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    update: (id, data) => {
        return axiosInstanceAdmin.put(`/api/v1/news/${id}`, data, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/news/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
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