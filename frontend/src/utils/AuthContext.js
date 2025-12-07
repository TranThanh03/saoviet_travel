import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthApi } from "services";
import { setAccessToken } from "./axiosInstance";
import { setLoading } from "./loading";
import { useLocation } from "react-router-dom";
import useIntervalRefreshToken from "components/refreshToken/user";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const path = location.pathname;
    const isValidPath = !path.includes("/auth") && !path.includes("/error") && !path.includes("/customers/activate");

    const login = (accessToken) => {
        setAccessToken(accessToken);
        setAuthenticated(true);
    };

    const logout = () => {
        setAccessToken(null);
        setAuthenticated(false);
    };

    const fetchRefreshToken = useCallback(async () => {
        try {
            const response = await AuthApi.refreshAccessToken();
            
            if (response?.code === 9994 && response?.result?.accessToken) {
                setAccessToken(response.result.accessToken);
                setAuthenticated(true);
            }
        }
        catch (error) {
            console.error("Failed fetch refresh access token: ", error)
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

    useIntervalRefreshToken(authenticated, setAuthenticated);

    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ authenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);