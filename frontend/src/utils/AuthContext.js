import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthApi, BookingApi } from "services";
import { setAccessToken } from "./axiosInstance";
import { setLoading } from "./loading";
import { useLocation } from "react-router-dom";
import useIntervalRefreshToken from "components/refreshToken/user";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [bookingCount, setBookingCount] = useState(0);
    const location = useLocation();
    const path = location.pathname;
    const isValidPath = !path.includes("/auth") && !path.includes("/error") && !path.includes("/customers/activate");

    const login = async (accessToken) => {
        setAccessToken(accessToken);
        setAuthenticated(true);
        await fetchPaymentPendingCount();
    };

    const logout = () => {
        setAccessToken(null);
        setAuthenticated(false);
        setBookingCount(0);
    };

    const fetchRefreshToken = useCallback(async () => {
        try {
            const response = await AuthApi.refreshAccessToken();
            
            if (response?.code === 1903 && response?.result?.accessToken) {
                setAccessToken(response.result.accessToken);
                setAuthenticated(true);
                await fetchPaymentPendingCount();
            }
        } catch (error) {
            console.error("Failed fetch refresh access token: ", error)
        }
    }, []);

    const fetchPaymentPendingCount = useCallback(async () => {
        try {
            const response = await BookingApi.getPaymentPendingCount();
            
            if (response?.code === 1817) {
                setBookingCount(response?.result);
            }
        } catch (error) {
            console.error("Failed fetch payment pending count: ", error)
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            if (isValidPath) {
                setLoading(true);
                await fetchRefreshToken();
                setLoading(false);
            }

            setIsLoading(false);
        };

        init();
    }, []);

    useIntervalRefreshToken(authenticated, setAuthenticated);

    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ authenticated, bookingCount, login, logout, setBookingCount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);