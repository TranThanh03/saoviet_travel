import { ROUTERS } from "utils/router.js";
import { Routes, Route, createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import * as usersPage from "pages/users";
import * as adminPage from "pages/admin";
import * as errorPage from "components/error/index.js";
import { AuthProvider } from "utils/AuthContext";
import { AdminAuthProvider } from "utils/AdminAuthContext";

const NotFoundRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/error/404", { replace: true });
    }, [navigate]);

    return <errorPage.Page404 />;
};

const NotFoundManageRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/manage/error/404", { replace: true });
    }, [navigate]);

    return <errorPage.ManagePage404 />;
};

const RenderRouter = () => {
    const customRouters = [
        {
            path: ROUTERS.USER.HOMEPAGE,
            component: <usersPage.HomePage />
        },
        {
            path: ROUTERS.USER.LOGINPAGE,
            component: <usersPage.LoginPage />
        },
        {
            path: ROUTERS.USER.FORGOTPASSWORDPAGE,
            component: <usersPage.ForgotPasswordPage />
        },
        {
            path: ROUTERS.USER.REGISTERPAGE,
            component: <usersPage.RegisterPage />
        },
        {
            path: ROUTERS.USER.PROFILEPAGE,
            component: <usersPage.ProfilePage />
        },
        {
            path: ROUTERS.USER.PASSWORDPAGE,
            component: <usersPage.PasswordPage />
        },
        {
            path: ROUTERS.USER.NEWSPAGE,
            component: <usersPage.NewsPage />
        },
        {
            path: ROUTERS.USER.NEWSDETAILPAGE,
            component: <usersPage.NewsDetailPage />
        },
        {
            path: ROUTERS.USER.TOURPAGE,
            component: <usersPage.TourPage />
        },
        {
            path: ROUTERS.USER.TOURDETAILPAGE,
            component: <usersPage.TourDetailPage />
        },
        {
            path: ROUTERS.USER.BOOKINGPAGE,
            component: <usersPage.BookingPage />
        },
        {
            path: ROUTERS.USER.CALENDARPAGE,
            component: <usersPage.CalendarPage />
        },
        {
            path: ROUTERS.USER.CALENDARDETAILPAGE,
            component: <usersPage.CalendarDetailPage />
        },
        {
            path: ROUTERS.USER.BOOKINGMESSAGEPAGE,
            component: <usersPage.MessagePage />
        },
        {
            path: ROUTERS.USER.SEARCHPAGE,
            component: <usersPage.SearchPage />
        },
        {
            path: ROUTERS.USER.SEARCHDESTINATIONPAGE,
            component: <usersPage.SearchDestinationPage />
        },
        {
            path: ROUTERS.USER.ACTIVATEPAGE,
            component: <usersPage.ActivatePage />
        },
        {
            path: ROUTERS.USER.ABOUTPAGE,
            component: <usersPage.AboutPage />
        },
        {
            path: ROUTERS.USER.DESTINATIONSPAGE,
            component: <usersPage.DestinationsPage />
        },
        {
            path: ROUTERS.ADMIN.LOGINPAGE,
            component: <adminPage.LoginPage />
        },
        {
            path: ROUTERS.ADMIN.FORGOTPASSWORDPAGE,
            component: <adminPage.ForgotPasswordPage />
        },
        {
            path: ROUTERS.ADMIN.CUSTOMERPAGE,
            component: <adminPage.CustomerPage />
        },
        {
            path: ROUTERS.ADMIN.TOURPAGE,
            component: <adminPage.TourPage />
        },
        {
            path: ROUTERS.ADMIN.TOURINSERTPAGE,
            component: <adminPage.TourInsertPage />
        },
        {
            path: ROUTERS.ADMIN.TOURUPDATEPAGE,
            component: <adminPage.TourUpdatePage />
        },
        {
            path: ROUTERS.ADMIN.SCHEDULEPAGE,
            component: <adminPage.SchedulePage />
        },
        {
            path: ROUTERS.ADMIN.SCHEDULEINSERTPAGE,
            component: <adminPage.ScheduleInsertPage />
        },
        {
            path: ROUTERS.ADMIN.CALENDARPAGE,
            component: <adminPage.CalendarPage />
        },
        {
            path: ROUTERS.ADMIN.CALENDARDETAILSPAGE,
            component: <adminPage.CalendarDetailPage />
        },
        {
            path: ROUTERS.ADMIN.PROFILEPAGE,
            component: <adminPage.ProfilePage />
        },
        {
            path: ROUTERS.ADMIN.PASSWORDPAGE,
            component: <adminPage.PasswordPage />
        },
        {
            path: ROUTERS.ADMIN.DASHBOARDPAGE,
            component: <adminPage.DashboardPage />
        },
        {
            path: ROUTERS.ADMIN.PROMOTIONPAGE,
            component: <adminPage.PromotionPage />
        },
        {
            path: ROUTERS.ADMIN.PROMOTIONUPDATEPAGE,
            component: <adminPage.PromotionUpdatePage />
        },
        {
            path: ROUTERS.ADMIN.PROMOTIONINSERTPAGE,
            component: <adminPage.PromotionInsertPage />
        },
        {
            path: ROUTERS.ADMIN.NEWSPAGE,
            component: <adminPage.NewsPage />
        },
        {
            path: ROUTERS.ADMIN.NEWSINSERTPAGE,
            component: <adminPage.NewsInsertPage />
        },
        {
            path: ROUTERS.ADMIN.NEWSUPDATEPAGE,
            component: <adminPage.NewsUpdatePage />
        },
        {
            path: ROUTERS.ERROR.ERROR500PAGE,
            component: <errorPage.Page500 />
        },
        {
            path: ROUTERS.ERROR.MANAGEERROR500PAGE,
            component: <errorPage.ManagePage500 />
        }
    ];

    const isAdminRoute = window.location.pathname.startsWith("/manage");

    return (
        isAdminRoute ? (
            <AdminAuthProvider>
                <adminPage.MasterLayout>
                    <Routes>
                        {customRouters
                            .filter(route => route.path.startsWith("/manage"))
                            .map((item, key) => (
                                <Route key={key} path={item.path} element={item.component} />
                            ))}
                        <Route path="*" element={<NotFoundManageRedirect />} />
                    </Routes>
                </adminPage.MasterLayout>
            </AdminAuthProvider>
        ) : (
            <AuthProvider>
                <usersPage.MasterLayout>
                    <Routes>
                        {customRouters
                            .filter(route => !route.path.startsWith("/manage"))
                            .map((item, key) => (
                                <Route key={key} path={item.path} element={item.component} />
                            ))}
                        <Route path="*" element={<NotFoundRedirect />} />
                    </Routes>
                </usersPage.MasterLayout>
            </AuthProvider>
        )
    );
};

const router = createBrowserRouter([
    {
        path: "/*",
        element: <RenderRouter />
    }
], {
    future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
    }
});

const RouterCustom = () => {
    return <RouterProvider router={router} />;
};

export default RouterCustom;