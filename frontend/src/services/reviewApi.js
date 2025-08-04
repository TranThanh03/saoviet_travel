import axiosInstance from "@utils/axiosInstance.js";
import axiosInstanceAdmin from "@utils/axiosInstanceAdmin.js";
import getToken from "@utils/getToken.js";

const ReviewApi = {
    getAll: (id) => {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        return axiosInstance.get(`/api/v1/reviews/${id}`, {
            headers
        });
    },
    create: (bookingId, data) => {
        return axiosInstanceAdmin.post(`/api/v1/reviews/${bookingId}`, data, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },
    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/reviews/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },
    check: (bookingId) => {
        return axiosInstanceAdmin.get(`/api/v1/reviews/check/${bookingId}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },
};

export default ReviewApi;