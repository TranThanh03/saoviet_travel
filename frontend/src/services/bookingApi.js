import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const BookingApi = {
    process: (data) => {
        return axiosInstance.post("/api/v1/bookings/process", data);
    },

    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/bookings", { params });
    },

    getDetailByAdmin: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/bookings/${id}/detail`);
    },

    getById: (id) => {
        return axiosInstance.get(`/api/v1/bookings/${id}`);
    },

    getByCustomerId: () => {
        return axiosInstance.get("/api/v1/bookings/list");
    },

    cancel: (id) => {
        return axiosInstance.patch(`/api/v1/bookings/${id}/cancel`, {});
    },

    cancelByAdmin: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/bookings/admin/${id}/cancel`, {});
    },

    confirm: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/bookings/${id}/confirm`, {});
    },

    confirmReserve: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/bookings/${id}/reserve`, {});
    },

    infoCount: () => {
        return axiosInstanceAdmin.get(`/api/v1/bookings/info-count`);
    },

    latest: () => {
        return axiosInstanceAdmin.get(`/api/v1/bookings/latest`);
    },

    popularTours: () => {
        return axiosInstanceAdmin.get(`/api/v1/bookings/top-popular`);
    },

    statusCount: () => {
        return axiosInstanceAdmin.get(`/api/v1/bookings/status-count`);
    },

    getStatistics: (year) => {
        return axiosInstanceAdmin.get(`/api/v1/bookings/${year}/statistics`);
    },

    getPaymentPendingCount: () => {
        return axiosInstance.get(`/api/v1/bookings/payment-pending/count`);
    }
};

export default BookingApi;