import axios from 'axios';
import { setLoading } from './loading.js';

const axiosInstance = axios.create({
    baseURL: 'https://saoviet-travel.onrender.com',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

const pendingRequests = new Set();

axiosInstance.interceptors.request.use(
    (config) => {
        config.metadata = {
            startTime: new Date().getTime(),
            skipLoading: false,
        };

        const timer = setTimeout(() => {
            setLoading(true);
        }, 250);
        config.metadata.timer = timer;

        pendingRequests.add(config);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        const config = response.config;

        if (config.metadata?.timer) {
            clearTimeout(config.metadata.timer);
        }

        pendingRequests.delete(config);

        if (pendingRequests.size === 0) {
            setLoading(false);
        }

        return response.data;
    },
    (error) => {
        const config = error.config || {};

        if (config.metadata?.timer) {
            clearTimeout(config.metadata.timer);
        }

        pendingRequests.delete(config);

        if (pendingRequests.size === 0) {
            setLoading(false);
        }

        if (error.response?.data?.code === 4445) {
            window.location.href = "/error/404";
        } else if (error.code === "ERR_NETWORK") {
            window.location.href = "/error/500";
        }

        return Promise.reject(error.response || error.message);
    }
);

export default axiosInstance;