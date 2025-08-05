import React, { memo, useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaAngleDown, FaSearch, FaRegCalendarAlt } from "react-icons/fa";
import { logo } from "assets";
import { AuthApi } from "services";
import "./style.scss";

const Header = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isShow, setShow] = useState(false);
    const { authenticated } = useContext(AuthContext);
    const [showSearch, setShowSearch] = useState(false);
    const [placeholder, setPlaceholder] = useState("Tìm kiếm tour");
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(null);
    const prevIndexRef = useRef(0);

    const menuItems = useMemo(
        () => [
            { path: "/", label: "Trang chủ" },
            { path: "/about", label: "Giới thiệu", topic: "/about" },
            { path: "/tour/index", label: "Tours", topic: "/tour" },
            { path: "/destinations/index", label: "Điểm đến", topic: "/destinations"},
            { path: "/news/index", label: "Tin tức", topic: "/news" },
        ],
        []
    );

    useEffect(() => {
        const currentIndex = menuItems.findIndex(
            (item) => location.pathname.startsWith(item.topic) || location.pathname === item.path
        );

        setActiveIndex(currentIndex === -1 ? prevIndexRef.current : currentIndex);
        prevIndexRef.current = currentIndex === -1 ? prevIndexRef.current : currentIndex;

    }, [location.pathname, menuItems]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchValue = queryParams.get('p') || '';
        setSearchQuery(searchValue);
    }, [location.search])

    const handleLogout = async () => {
        try {
            const response = await AuthApi.logout();

            if (response.code === 9997) {
                window.location.href = "/";
            } else {
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/";
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        
        if (searchQuery.trim() !== "") {
            setShowSearch(!showSearch);
            navigate(`/tour/search?p=${encodeURIComponent(searchQuery)}`);
        } else {
            setPlaceholder("Vui lòng nhập tour...");
        }
    };

    const handleToggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleMenuItemClick = () => {
        setMenuOpen(false);
    };

    return (
        <header className="header-custom main-header header-one shadow-sm bg-white">
            <div className="header-upper py-10 rpy-0">
                <div className="container-fluid clearfix">
                    <div className="header-inner rel d-flex align-items-center">
                        <div className="logo-outer">
                            <div className="logo d-flex align-items-center">
                                <img src={logo} alt="Logo" title="Logo" />
                                <span className="fw-bold fs-4 ms-2 title">Sao Việt</span>
                            </div>
                        </div>

                        <div className="nav-outer mx-lg-auto ps-xxl-5 clearfix">
                            <nav className="main-menu navbar-expand-lg">
                                <div className="navbar-header">
                                    <div className="mobile-logo py-2">
                                        <img src={logo} alt="Logo" title="Logo" />
                                    </div>
                                    <button
                                        type="button"
                                        className={`navbar-toggle ${menuOpen ? "" : "collapsed"}`}
                                        data-bs-toggle="collapse"
                                        data-bs-target=".navbar-collapse"
                                        aria-expanded={menuOpen ? "true" : "false"}
                                        onClick={handleToggleMenu}
                                    >
                                        <span className="icon-bar"></span>
                                        <span className="icon-bar"></span>
                                        <span className="icon-bar"></span>
                                    </button>
                                </div>

                                <div className={`navbar-collapse collapse px-3 clearfix ${menuOpen ? "show" : ""}`}>
                                    <ul className="navigation bg-light px-1 py-1 clearfix">
                                        {menuItems.map((item, index) => (
                                            <li key={index} onClick={handleMenuItemClick}>
                                                <Link className={`${activeIndex === index ? "active" : ""}`} to={item.path}>
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </nav>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <div className="nav-search">
                                <button type="button" className="btn btn-custom p-0 text-dark" onClick={() => {setShowSearch(!showSearch); setPlaceholder("Tìm kiếm tour")}}>
                                    <FaSearch size={15}/>
                                </button>
                                {showSearch && (
                                    <form
                                        onSubmit={handleSearch}
                                        className="search-dropdown bg-light rounded-pill d-flex align-items-center position-absolute show mt-2 pe-2"
                                    >
                                        <input
                                            type="text"
                                            className="form-control bg-transparent border-0"
                                            placeholder={placeholder}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                        <button type="submit" className="btn px-2 text-dark btn-2-custom">
                                            <FaSearch />
                                        </button>
                                    </form>
                                )}
                            </div>

                            <Link to="/calendar/index" className="text-dark fs-5">
                                <FaRegCalendarAlt size={30} />
                            </Link>

                            <div className="dropdown">
                                <button
                                    className="btn btn-link p-0 text-dark d-flex align-items-center"
                                    onClick={() => setShow(!isShow)}
                                >
                                    <FaUserCircle size={30} />
                                    <FaAngleDown className="ms-1" />
                                </button>
                                {isShow && (
                                    <ul className="dropdown-menu dropdown-menu-end show mt-2">
                                        {authenticated ? (
                                            <>
                                                <li><Link className="dropdown-item" to="/customer/infor" onClick={() => setShow(false)}>Thông tin</Link></li>
                                                <li><Link className="dropdown-item" to="/customer/password" onClick={() => setShow(false)}>Mật khẩu</Link></li>
                                                <li><button className="dropdown-item" onClick={handleLogout}>Đăng xuất</button></li>
                                            </>
                                        ) : (
                                            <>
                                                <li><Link className="dropdown-item" to="/auth/login" onClick={() => setShow(false)}>Đăng nhập</Link></li>
                                                <li><Link className="dropdown-item" to="/auth/register" onClick={() => setShow(false)}>Đăng ký</Link></li>
                                            </>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default memo(Header);