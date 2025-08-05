import { memo, useState, useContext } from 'react';
import './style.scss';
import { Link } from 'react-router-dom';
import { AuthApi } from 'services';
import { AuthContext } from '../masterLayout';
import { FaUserCircle, FaAngleDown, FaBars } from 'react-icons/fa';

const Header = ({ isSidebar, setIsSidebar }) => {
    const [isShow, setIsShow] = useState(false);
    const { authenticated } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            const response = await AuthApi.logoutAdmin();

            if (response.code === 9994) {
                window.location.href = "/manage/auth/login";
            } else {
                window.location.href = "/manage/auth/login";
            }
        } catch (error) {
            console.error("Failed logout:", error);
            window.location.href = "/manage/auth/login";
        }
    };

    return (
        <div className="top_nav header-manage no-print">
            <div className="nav_menu">
                <FaBars size={28} className="cursor-pointer" onClick={() => setIsSidebar(!isSidebar)}/>

                <div className="dropdown">
                    <button
                        className="btn btn-link p-0 text-dark d-flex align-items-center"
                        onClick={() => setIsShow(!isShow)}
                    >
                        <FaUserCircle size={30} />
                        <FaAngleDown className="ms-1" />
                    </button>
                    {isShow && (
                        <ul className="dropdown-menu dropdown-menu-end show mt-2">
                            {authenticated && (
                                <>
                                    <li><Link className="dropdown-item" to="/manage/infor" onClick={() => setIsShow(false)}>Thông tin</Link></li>
                                    <li><Link className="dropdown-item" to="/manage/password" onClick={() => setIsShow(false)}>Mật khẩu</Link></li>
                                    <li><button className="dropdown-item" onClick={handleLogout}>Đăng xuất</button></li>
                                </>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(Header);