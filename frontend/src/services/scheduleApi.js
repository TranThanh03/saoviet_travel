import axiosInstance from "utils/axiosInstance.js";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin.js";
import getToken from "utils/getToken.js";

const AssignmentApi = {
    getAll: (params) => {
        return axiosInstanceAdmin.get("/api/v1/schedules", { 
            params,
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    getById: (id) => {
        return axiosInstanceAdmin.get(`/api/v1/schedules/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    create: (data) => {
        return axiosInstanceAdmin.post("/api/v1/schedules", data, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    update: (id, params) => {
        return axiosInstanceAdmin.put(`/api/v1/schedules/${id}`,
            {},
            {
                params,
                headers: {
                    Authorization: `Bearer ${getToken(true)}`
                }
            }
        );
    },
    delete: (id) => {
        return axiosInstanceAdmin.delete(`/api/v1/schedules/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    getByTourId: (id) => {
        return axiosInstance.get(`/api/v1/schedules/tour/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },
    getScheduleTourById: (id) => {
        return axiosInstance.get(`/api/v1/schedules/schedule-tour/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },
    getStartDateByTourId: (tourId) => {
        return axiosInstanceAdmin.get(`/api/v1/schedules/start-date/${tourId}`, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
};

export default AssignmentApi;