import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const TourApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/tours", { params });
    },
    getById: (id) => {
        return axiosInstance.get(`/api/v1/tours/${id}`);
    },
    checkNotStarted: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/tours/not-started/${id}`);
    },
    create: (data) => {
        return axiosInstanceAdmin.post("/api/v1/tours", data);
    },
    update: (id, data) => {
        return axiosInstanceAdmin.put(`/api/v1/tours/${id}`, data);
    },
    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/tours/${id}`);
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
        return axiosInstanceAdmin.get("/api/v1/tours/list/summary");
    },
    getHot: () => {
        return axiosInstance.get("/api/v1/tours/hot");
    },
};

export default TourApi;