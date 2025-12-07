import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const PaymentApi = {
    validate: (code) => {
        return axiosInstance.get(`/api/v1/payments/${code}/validate`);
    },

    retry: (data) => {
        return axiosInstance.post("/api/v1/payments/retry", data);
    },

    confirm: (id, code) => {
        return axiosInstanceAdmin.patch(`/api/v1/payments/${id}/confirm?code=${code}`, {});
    }
};

export default PaymentApi;