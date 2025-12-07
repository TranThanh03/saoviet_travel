import { memo } from 'react';
import './style.scss';

const Page404 = () => {
    return (
        <div className="error-404-container">
            <div className="main">
                <p className="error-code">404</p>
                <p className="error-message">Không tìm thấy trang bạn đang tìm kiếm!</p>
                <a href="/" className="back-home">Về trang chủ</a>
            </div>
        </div>
    )
}

export default memo(Page404)