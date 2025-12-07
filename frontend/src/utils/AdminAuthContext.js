import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AdminApi } from "services";
import { setAccessTokenAdmin } from "./axiosInstanceAdmin";
import { setLoading } from "./loading";
import useIntervalRefreshTokenAdmin from "components/refreshToken/admin";
import Loading from "components/loading";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [isSidebar, setIsSidebar] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const notRefresh = [
        "/manage/auth/login",
        "/manage/auth/forgot-password",
        "/manage/error/404",
        "/manage/error/500"
    ];
    const location = useLocation();
    const path = location.pathname;

    const login = (accessToken) => {
        setAccessTokenAdmin(accessToken);
        setAuthenticated(true);
    };

    const logout = () => {
        setAccessTokenAdmin(null);
        setAuthenticated(false);
    };

    const fetchRefreshToken = useCallback(async () => {
        try {
            const response = await AdminApi.refreshAccessToken();

            if (response.code === 1202 && response?.result?.accessToken) {
                setAccessTokenAdmin(response.result.accessToken);
                setAuthenticated(true);
            } else {
                window.location.href = "/manage/auth/login";
            }
        }
        catch (error) {
            console.error("Failed fetch refresh access token: ", error)
            window.location.href = "/manage/auth/login";
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            if (!notRefresh.includes(path)) {
                setLoading(true);
                await fetchRefreshToken();
            }

            setIsLoading(false);
        };

        init();
    }, []);
    
    useIntervalRefreshTokenAdmin(authenticated, setAuthenticated);

    if (isLoading) {
        return null;
    }

    return (
        <AdminAuthContext.Provider value={{ authenticated, isSidebar, login, logout, setIsSidebar }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);