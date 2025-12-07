import axios from 'axios';
import { setLoading } from './loading.js';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BE_BASE_URL,
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

const pendingRequests = new Set();
const skipEndpoints = [
    { method: 'POST', endpoint: '/api/v1/auth/login' },
    { method: 'POST', endpoint: '/api/v1/auth/token/refresh' },
    { method: 'PATCH', endpoint: '/api/v1/customers' },
    { method: 'POST', endpoint: '/api/v1/customers' },
    { method: null, endpoint: '/api/v1/chatbot' },
    { method: 'POST', endpoint: '/api/v1/bookings/process' },
    { method: 'POST', endpoint: '/api/v1/payments/retry' },
    { method: 'PATCH', endpoint: '/api/v1/bookings' },
    { method: null, endpoint: '/api/v1/auth/forgot-password' }
];

const shouldSkipLoading = (url = '', method = '') => {
    return skipEndpoints.some(item => {
        return item.method ? item.method === method && url.includes(item.endpoint) : url.includes(item.endpoint);
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
            skipLoading: shouldSkipLoading(config.url, config.method.toUpperCase()),
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