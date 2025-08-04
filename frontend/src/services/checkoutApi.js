import axiosInstance from "@utils/axiosInstance.js";
import axiosInstanceAdmin from "@utils/axiosInstanceAdmin.js";
import getToken from "@utils/getToken.js";

const CheckoutApi = {
    process: (data) => {
        return axiosInstance.post("/api/v1/checkouts/process", data, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
    },
    momoCallback: (params) => {
        return axiosInstance.post(`/api/v1/checkouts/momo/callback?${params}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );
    },
    vnpayCallback: (params) => {
        return axiosInstance.post(`/api/v1/checkouts/vnpay/callback?${params}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );
    },
    confirm: (id) => {
        return axiosInstanceAdmin.patch(`/api/v1/checkouts/confirm/${id}`, {}, {
            headers: {
                Authorization: `Bearer ${getToken(true)}`
            }
        });
    },
};

export default CheckoutApi;