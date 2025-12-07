import axios from 'axios';
import { setLoading } from './loading.js';

const axiosInstanceAdmin = axios.create({
    baseURL: process.env.REACT_APP_BE_BASE_URL,
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

const pendingRequests = new Set();
const loadingEndpoints = [
    { method: 'POST', endpoint: 'api/v1/admin/auth/logout' }
];

const shouldLoading = (url = '', method = '') => {
    return loadingEndpoints.some(item => {
        return item.method === method && url.includes(item.endpoint);
    });
};

let accessToken = null;

export const setAccessTokenAdmin = (token) => {
    accessToken = token;
};

axiosInstanceAdmin.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        config.metadata = {
            loading: shouldLoading(config.url, config.method.toUpperCase()),
        };

        if (config.metadata.loading) {
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

        if (error.response?.data?.code === 1002) {
            window.location.href = "/manage/auth/login";
        }
        
        if ((navigator.onLine && error.code === "ERR_NETWORK") || error?.status === 500) {
            window.location.href = "/manage/error/500";
        }

        return Promise.reject(error.response || error.message);
    }
);

export default axiosInstanceAdmin;