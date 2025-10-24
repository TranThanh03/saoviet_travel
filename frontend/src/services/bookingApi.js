import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const BookingApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/bookings", { params });
    },
    getByIdAndAdmin: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/bookings/detail/${id}`);
    },
    getById: (id) => {
        return axiosInstance.get(`/api/v1/bookings/${id}`);
    },
    getByCustomerId: () => {
        return axiosInstance.get("/api/v1/bookings/list");
    },
    cancel: (id) => {
        return axiosInstance.patch(`/api/v1/bookings/cancel/${id}`, {});
    },
    cancelByAdmin: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/bookings/admin/cancel/${id}`, {});
    },
    confirm: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/bookings/confirm/${id}`, {});
    },
    confirmReserve: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/bookings/reserve/${id}`, {});
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
        return axiosInstanceAdmin.get(`/api/v1/bookings/statistics/${year}`);
    }
};

export default BookingApi;