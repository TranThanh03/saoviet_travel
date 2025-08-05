import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const AdminApi = {
    infor: () => {
        return axiosInstanceAdmin.get("/api/v1/admin/infor");
    },
    update: (data) => {
        return axiosInstanceAdmin.put(`/api/v1/admin`, data);
    },
    changePassword: (data) => {
        return axiosInstanceAdmin.put(`/api/v1/admin/password`, data);
    },
};

export default AdminApi;