import { memo, useState } from 'react';
import './style.scss';
import { Link } from 'react-router-dom';
import { AuthApi } from 'services';
import { FaUserCircle, FaAngleDown, FaBars } from 'react-icons/fa';
import { ErrorToast } from 'components/notifi';
import { useAdminAuth } from 'utils/AdminAuthContext';

const Header = () => {
    const [isShow, setIsShow] = useState(false);
    const { authenticated, isSidebar, setIsSidebar } = useAdminAuth();

    const handleLogout = async () => {
        try {
            const response = await AuthApi.logoutAdmin();

            if (response.code === 9995) {
                window.location.href = "/manage/auth/login";
            } else {
                ErrorToast("Đã xảy ra lỗi không xác định!");
            }
        } catch (error) {
            console.error("Failed logout:", error);
            ErrorToast("Đã xảy ra lỗi không xác định!");
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