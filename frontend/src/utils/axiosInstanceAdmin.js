import axios from 'axios';
import { setLoading } from './loading.js';

const axiosInstanceAdmin = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

const pendingRequests = new Set();
const skipEndpoints = [
    '/api/v1/auth/admin/login'
];

const shouldSkipLoading = (url = '') => {
    return skipEndpoints.some(endpoint => url.includes(endpoint));
};

axiosInstanceAdmin.interceptors.request.use(
    (config) => {
        config.metadata = {
            skipLoading: shouldSkipLoading(config.url),
        };

        if (!config.metadata.skipLoading) {
            setLoading(true);
            pendingRequests.add(config);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstanceAdmin.interceptors.response.use(
    (response) => {
        const config = response.config;

        if (!config.metadata?.skipLoading) {
            pendingRequests.delete(config);

            if (pendingRequests.size === 0) {
                setLoading(false);
            }
        }

        return response.data;
    },
    (error) => {
        const config = error.config || {};

        if (!config.metadata?.skipLoading) {
            pendingRequests.delete(config);

            if (pendingRequests.size === 0) {
                setLoading(false);
            }
        }

        if (error.response?.data?.code === 4445) {
            if (config.url?.includes("/api/v1/auth/admin/introspect")) {
                return Promise.reject(error.response || error.message);
            }

            window.location.href = "/manage/error/404";
        } else if (error.code === "ERR_NETWORK") {
            window.location.href = "/manage/auth/login";
        }

        return Promise.reject(error.response || error.message);
    }
);

export default axiosInstanceAdmin;