import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const ReviewApi = {
    getAll: (id) => {
        return axiosInstance.get(`/api/v1/reviews/${id}`);
    },
    create: (bookingId, data) => {
        return axiosInstanceAdmin.post(`/api/v1/reviews/${bookingId}`, data);
    },
    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/reviews/${id}`);
    },
    check: (bookingId) => {
        return axiosInstanceAdmin.get(`/api/v1/reviews/check/${bookingId}`);
    },
};

export default ReviewApi;