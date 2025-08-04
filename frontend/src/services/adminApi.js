import axiosInstanceAdmin from "@utils/axiosInstanceAdmin.js";
import getToken from "@utils/getToken.js";

const AdminApi = {
    infor: () => {
        return axiosInstanceAdmin.get("/api/v1/admin/infor", {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    update: (data) => {
        return axiosInstanceAdmin.put(`/api/v1/admin`, data, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
    changePassword: (data) => {
        return axiosInstanceAdmin.put(`/api/v1/admin/password`, data, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
};

export default AdminApi;