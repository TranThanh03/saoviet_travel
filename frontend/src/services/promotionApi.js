import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const PromotionApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/promotions", { params });
    },

    getById: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/promotions/${id}`);
    },

    getList: () => {
        return axiosInstance.get("/api/v1/promotions/list");
    },

    create: (data) => {
        return axiosInstanceAdmin.post("/api/v1/promotions", data);
    },

    update: (id, data) => {
        return axiosInstanceAdmin.patch(`/api/v1/promotions/${id}`, data);
    },

    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/promotions/${id}`);
    }
};

export default PromotionApi;