import axios from 'axios';
import { setLoading } from './loading.js';

const axiosInstance = axios.create({
    baseURL: 'https://saoviet-travel.onrender.com',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

const pendingRequests = new Set();

const getRequestKey = (config) => `${config.method}-${config.url}`;

const shouldSkipLoading = (url = '') => {
    return url.includes('/api/v1/chatbot') || url.includes('/api/v1/auth/introspect');
};

axiosInstance.interceptors.request.use(
    (config) => {
        const url = config.url || '';

        config.metadata = {
            startTime: new Date().getTime(),
            skipLoading: shouldSkipLoading(url),
        };

        if (!config.metadata.skipLoading) {
            const timer = setTimeout(() => {
                setLoading(true);
            }, 250);
            config.metadata.timer = timer;
        }

        pendingRequests.add(getRequestKey(config));
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => {
        const config = response.config;

        if (config.metadata?.timer) {
            clearTimeout(config.metadata.timer);
        }

        pendingRequests.delete(getRequestKey(config));

        if (!config.metadata?.skipLoading && pendingRequests.size === 0) {
            setLoading(false);
        }

        return response.data;
    },
    (error) => {
        const config = error.config || {};
        config.metadata = config.metadata || {};

        if (config.metadata.timer) {
            clearTimeout(config.metadata.timer);
        }

        pendingRequests.delete(getRequestKey(config));

        if (!config.metadata.skipLoading && pendingRequests.size === 0) {
            setLoading(false);
        }

        const url = config.url || '';

        if (error.response?.data?.code === 4445) {
            if (shouldSkipLoading(url)) {
                return Promise.reject(error.response || error.message);
            }

            window.location.href = "/error/404";
        } else if (error.code === "ERR_NETWORK") {
            window.location.href = "/error/500";
        }

        return Promise.reject(error.response || error.message);
    }
);

export default axiosInstance;
