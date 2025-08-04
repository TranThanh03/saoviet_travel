import { memo } from 'react';
import { Link } from 'react-router-dom';
import './style.scss';

const Page404 = () => {
    return (
        <div className="error-404-container-manage">
            <div className="main">
                <p className="error-code">404</p>
                <p className="error-message">Không tìm thấy trang bạn đang tìm kiếm!</p>
                <Link to="/manage/dashboard" className="back-home">Quay lại trang chủ</Link>
            </div>
        </div>
    )
}

export default memo(Page404)