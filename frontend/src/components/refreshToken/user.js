import { useCallback, useEffect, useRef } from 'react';
import { AuthApi } from 'services';
import { setAccessToken } from 'utils/axiosInstance';

export default function useIntervalRefreshToken(authenticated, setAuthenticated) {
    const intervalRef = useRef(null);

    const fetchRefreshToken = useCallback(async () => {
        try {
            const response = await AuthApi.refreshAccessToken();

            if (response?.code === 9994 && response?.result?.accessToken) {
                setAccessToken(response.result.accessToken);
                setAuthenticated(true);
            } else {
                setAccessToken(null);
                setAuthenticated(false);

                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
        } catch (error) {
            console.error("Failed refresh token:", error);
            setAccessToken(null);
            setAuthenticated(false);

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, []);

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