import axios from 'axios';
import { setLoading } from './loading.js';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

const pendingRequests = new Set();
const skipEndpoints = [
    '/api/v1/chatbot',
    '/api/v1/auth/login',
    '/api/v1/customers',
    '/api/v1/auth/token/refresh'
];

const shouldSkipLoading = (url = '') => {
    return skipEndpoints.some(endpoint => {
        if (endpoint === '/api/v1/customers') {
            return url === endpoint;
        } else {
            return url.includes(endpoint);
        }
    });
};

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

axiosInstance.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

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

axiosInstance.interceptors.response.use(
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
        
        if ((navigator.onLine && error.code === "ERR_NETWORK") || error?.status === 500) {
            window.location.href = "/error/500";
        }

        return Promise.reject(error.response || error.message);
    }
);

export default axiosInstance;