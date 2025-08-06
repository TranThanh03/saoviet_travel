import axios from 'axios';
import { setLoading } from './loading.js';

const axiosInstanceAdmin = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

const pendingRequests = new Set();

axiosInstanceAdmin.interceptors.request.use(
    (config) => {
        config.metadata = {};
        setLoading(true);
        pendingRequests.add(config);

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstanceAdmin.interceptors.response.use(
    (response) => {
        pendingRequests.delete(response.config);

        if (pendingRequests.size === 0) {
            setLoading(false);
        }

        return response.data;
    },
    (error) => {
        pendingRequests.delete(error.config || {});

        if (pendingRequests.size === 0) {
            setLoading(false);
        }

        if (error.response?.data?.code === 4445) {
            if (error.config?.url?.includes("/api/v1/auth/admin/introspect")) {
                return Promise.reject(error.response || error.message);
            }

            window.location.href = "/manage/error/404";
        } else if (error.request?.status === 401) {
            window.location.href = "/manage/auth/login";
        } else if (error.code === "ERR_NETWORK") {
            window.location.href = "/manage/auth/login";
        }

        return Promise.reject(error.response || error.message);
    }
);

export default axiosInstanceAdmin;