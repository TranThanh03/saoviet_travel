import { memo, useState, useEffect, createContext } from "react";
import Footer from "../footer";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthApi } from "@services";
import getToken from "@utils/getToken.js";
import Sidebar from "../sidebar";
import Header from "../header";

export const AuthContext = createContext(null);

const MasterLayout = ({ children }) => {
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();

    const isLoginPage = path === "/manage/auth/login";
    const isValidPath = !path.includes("/manage/auth") && !path.includes("/error");

    const [authenticated, setAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebar, setIsSidebar] = useState(false);

    useEffect(() => {
        if (isLoginPage) {
            setIsLoading(false);
            return;
        }

        const fetchAuth = async () => {
            try {
                const tokenAdmin = getToken(true);

                if (tokenAdmin) {
                    const response = await AuthApi.introspectAdmin();

                    if (response?.code === 9995) {
                        setAuthenticated(response?.result);
                        setIsLoading(false);
                    }
                    else {
                        navigate("/manage/auth/login");
                    }
                }
                else {
                    navigate("/manage/auth/login");
                }
            } catch (error) {
                navigate("/manage/auth/login");
            }
        };

        fetchAuth();
    }, [navigate, isLoginPage]);

    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ authenticated }}>
            <link rel="stylesheet" href="/admin/css/custom-css.css" />
            <link rel="stylesheet" href="/admin/css/custom.css" />

            <div className={`page-saoviet ${isSidebar ? 'nav-sm' : 'nav-md'}`}>
                <div className={isValidPath ? 'container body' : ''}>
                    <div className="main_container">
                        {!isLoginPage && isValidPath && <Sidebar />}
                        {!isLoginPage && isValidPath && <Header authenticated={authenticated} isSidebar={isSidebar} setIsSidebar={setIsSidebar} />}
                        <div className="right_col min-vh-100">
                            {children}
                        </div>
                        {!isLoginPage && isValidPath && <Footer />}
                    </div>
                </div>     
            </div>
        </AuthContext.Provider>
    );
};

export default memo(MasterLayout);