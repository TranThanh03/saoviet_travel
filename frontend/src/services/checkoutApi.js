import axiosInstance from "utils/axiosInstance";
import axiosInstanceAdmin from "utils/axiosInstanceAdmin";

const CheckoutApi = {
    process: (data) => {
        return axiosInstance.post("/api/v1/checkouts/process", data);
    },
    momoCallback: (params) => {
        return axiosInstance.post(`/api/v1/checkouts/momo/callback?${params}`, {});
    },
    vnpayCallback: (params) => {
        return axiosInstance.post(`/api/v1/checkouts/vnpay/callback?${params}`, {});
    },
    confirm: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/checkouts/confirm/${id}`, {});
    },
};

export default CheckoutApi;