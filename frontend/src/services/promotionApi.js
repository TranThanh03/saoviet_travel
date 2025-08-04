import axiosInstance from "@utils/axiosInstance.js";
import axiosInstanceAdmin from "@utils/axiosInstanceAdmin.js";
import getToken from "@utils/getToken.js";

const PromotionApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/promotions",  {
            params,
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    getById: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/promotions/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    getList: () => {
        return axiosInstance.get("/api/v1/promotions/list");
    },
    create: (data) => {
        return axiosInstanceAdmin.post("/api/v1/promotions", data, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    update: (id, data) => {
        return axiosInstanceAdmin.put(`/api/v1/promotions/${id}`, data, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/promotions/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
};

export default PromotionApi;