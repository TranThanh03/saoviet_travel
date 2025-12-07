import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthApi } from "services";
import { setAccessTokenAdmin } from "./axiosInstanceAdmin";
import { setLoading } from "./loading";
import useIntervalRefreshTokenAdmin from "components/refreshToken/admin";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [isSidebar, setIsSidebar] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const path = location.pathname;
    const isValidPath = !path.includes("/manage/auth/login") && !path.includes("/manage/error/500");

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
            const response = await AuthApi.refreshAccessTokenAdmin();

            if (response.code === 9993 && response?.result?.accessToken) {
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
            if (isValidPath) {
                setLoading(true);
                await fetchRefreshToken();
                setLoading(false);
            } else {
                setIsLoading(false);
            }
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