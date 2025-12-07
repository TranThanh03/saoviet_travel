import { useCallback, useEffect, useRef } from "react";
import { AuthApi } from "services";
import { setAccessTokenAdmin } from "utils/axiosInstanceAdmin";

export default function useIntervalRefreshTokenAdmin(authenticated, setAuthenticated) {
    const intervalRef = useRef(null);

    const fetchRefreshToken = useCallback(async () => {
        try {
            const response = await AuthApi.refreshAccessTokenAdmin();

            if (response?.code === 9993 && response?.result?.accessToken) {
                setAccessTokenAdmin(response.result.accessToken);
                setAuthenticated(true);
            } else {
                setAccessTokenAdmin(null);
                setAuthenticated(false);

                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }

                window.location.href = "/manage/auth/login";
            }
        } catch (error) {
            console.error("Failed refresh access token:", error);
            setAccessTokenAdmin(null);
            setAuthenticated(false);

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            window.location.href = "/manage/auth/login";
        }
    }, [setAuthenticated]);

    useEffect(() => {
        if (!authenticated) return;

        intervalRef.current = setInterval(fetchRefreshToken, Number(process.env.REACT_APP_REFRESH_TOKEN_TIME) || 4 * 60 * 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [authenticated, fetchRefreshToken]);
}
