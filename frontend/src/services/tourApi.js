import axiosInstance from "@utils/axiosInstance.js";
import axiosInstanceAdmin from "@utils/axiosInstanceAdmin.js";
import getToken from "@utils/getToken.js";

const TourApi = {
    getAll: (params) => {
        return axiosInstance.get("/api/v1/tours", { 
            params,
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    getById: (id) => {
        return axiosInstance.get(`/api/v1/tours/${id}`);
    },
    checkNotStarted: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/tours/not-started/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    create: (data) => {
        return axiosInstanceAdmin.post("/api/v1/tours", data, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    update: (id, data) => {
        return axiosInstanceAdmin.put(`/api/v1/tours/${id}`, data, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/tours/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    filter: (data, params) => {
        return axiosInstance.post("/api/v1/tours/filter", data, {
            params: params,
        });
    },
    filterArea: (data, params) => {
        return axiosInstance.post("/api/v1/tours/filter-area", data, {
            params: params,
        });
    },
    areaCount: () => {
        return axiosInstance.get("/api/v1/tours/area-count");
    },
    popular: () => {
        return axiosInstance.get("/api/v1/tours/popular");
    },
    searchTours: (data, params) => {
        return axiosInstance.post("/api/v1/tours/search", data, {
            params: params,
        });
    },
    searchToursDestination: (data, params) => {
        return axiosInstance.post("/api/v1/tours/search-destination", data, {
            params: params,
        });
    },
    getSimilar: (params) => {
        return axiosInstance.get("/api/v1/tours/similar", { params });
    },
    getList: () => {
        return axiosInstance.get("/api/v1/tours/list", { 
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    getHot: () => {
        return axiosInstance.get("/api/v1/tours/hot");
    },
};

export default TourApi;