import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const ScheduleApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/schedules", { params });
    },

    getById: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/schedules/${id}`);
    },

    create: (data) => {
        return axiosInstanceAdmin.post("/api/v1/schedules", data);
    },

    update: (id, params) => {
        return axiosInstanceAdmin.patch(`/api/v1/schedules/${id}`,
            {},
            {
                params: params,
            }
        );
    },

    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/schedules/${id}`);
    },

    getByTourId: (id) => {
        return axiosInstance.get(`/api/v1/schedules/tour/${id}`);
    },

    getScheduleTourById: (id) => {
        return axiosInstance.get(`/api/v1/schedules/schedule-tour/${id}`);
    },

    getStartDateByTourId: (tourId) => {
        return axiosInstanceAdmin.get(`/api/v1/schedules/${tourId}/start-date`);
    }
};

export default ScheduleApi;