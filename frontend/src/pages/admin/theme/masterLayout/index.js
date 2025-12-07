import { memo } from "react";
import Footer from "../footer";
import { useLocation } from "react-router-dom";
import Sidebar from "../sidebar";
import Header from "../header";
import { useAdminAuth } from "utils/AdminAuthContext";

const MasterLayout = ({ children }) => {
    const location = useLocation();
    const path = location.pathname;
    const isLoginPage = path === "/manage/auth/login";
    const isValidPath = !path.includes("/manage/auth") && !path.includes("/manage/error");
    const { isSidebar } = useAdminAuth();

    return (
        <div className={`page-saoviet ${isSidebar ? 'nav-sm' : 'nav-md'}`}>
            <div className={isValidPath ? 'container body' : ''}>
                <div className="main_container">
                    {!isLoginPage && isValidPath && <Sidebar />}
                    {!isLoginPage && isValidPath && <Header />}
                    <div className="right_col min-vh-100">
                        {children}
                    </div>
                    {!isLoginPage && isValidPath && <Footer />}
                </div>
            </div>     
        </div>
    );
};

export default memo(MasterLayout);