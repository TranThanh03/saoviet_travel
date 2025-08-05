import { memo, useState, useEffect, useRef, useMemo } from 'react';
import { userAvatar } from 'assets';
import './style.scss';
import { Link, useLocation } from 'react-router-dom';
import { FaAngleDown } from 'react-icons/fa';

const Navbar = () => {
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const prevIndexRef = useRef(0);

    const menuItems = useMemo(() => [
        {
            path: "/manage/dashboard",
            label: "Dashboard",
            icon: "fa-solid fa-gauge ps-1",
            topic: "/dashboard"
        },
        {
            path: "/manage/customers",
            label: "Quản lý khách hàng",
            icon: "fa-solid fa-users",
            topic: "/customers"
        },
        {
            label: "Quản lý tours",
            icon: "fa-table",
            topic: "/tours",
            children: [
                { path: "/manage/tours/index", label: "Danh sách" },
                { path: "/manage/schedules", label: "Lịch trình" }
            ]
        },
        {
            path: "/manage/calendars",
            label: "Quản lý lịch đặt",
            icon: "fa-solid fa-calendar-days",
            topic: "/calendars"
        },
        {
            path: "/manage/promotions",
            label: "Quản lý khuyến mãi",
            icon: "fa-solid fa-ticket",
            topic: "/promotions"
        },
        {
            path: "/manage/news",
            label: "Quản lý tin tức",
            icon: "fa-solid fa-newspaper",
            topic: "/news"
        }
    ], []);

    useEffect(() => {
        const findActiveIndex = () => {
            for (let i = 0; i < menuItems.length; i++) {
                const item = menuItems[i];

                if (item.topic && location.pathname.includes(item.topic)) return i;
                if (item.path && location.pathname === item.path) return i;

                if (item.children) {
                    for (let child of item.children) {
                        if (location.pathname === child.path) return i;
                    }
                }
            }

            return prevIndexRef.current;
        };

        const index = findActiveIndex();
        setActiveIndex(index);
        prevIndexRef.current = index;
    }, [location.pathname, menuItems]);

    return (
        <ul className="nav side-menu">
            {menuItems.map((item, index) => (
                <li key={index} className={activeIndex === index ? 'active' : ''}>
                    {item.children ? (
                        <>
                            <a onClick={() => setIsOpen(!isOpen)} >
                                <i className={`fa ${item.icon}`}></i> {item.label}
                                <FaAngleDown className="float-right"/>
                            </a>

                            <ul className="nav child_menu" style={{ display: isOpen ? 'block' : 'none' }}>
                                {item.children.map((child, idx) => (
                                    <li key={idx}>
                                        <Link to={child.path} onClick={() => setIsOpen(false)}>{child.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <Link to={item.path} onClick={() => setIsOpen(false)}>
                            <i className={`fa ${item.icon}`}></i> {item.label}
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    );
};


const Sidebar = () => {
    return (
        <div className="col-md-3 left_col sidebar-manage-custom">
            <div className="left_col scroll-view">
                <div className="clearfix"></div>

                <div className="profile clearfix">
                    <div className="profile_pic">
                        <img src={userAvatar} alt="avatar" className="img-circle profile_img" />
                    </div>
                    <div className="profile_info">
                        <span>Xin chào,</span>
                        <h2>Admin</h2>
                    </div>
                </div>

                <br />

                <div id="sidebar-menu" className="main_menu_side hidden-print main_menu">
                    <div className="menu_section">
                        <Navbar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Sidebar);