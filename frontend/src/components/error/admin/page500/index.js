import { memo } from 'react';
import './style.scss';

const Page500 = () => {
    return (
        <div className="error-500-container">
            <div className="error-content">
                <h1 className="fw-bold">500 - Internal Server Error</h1>
                <p>Rất tiếc, có sự cố xảy ra trên máy chủ của chúng tôi. Vui lòng thử lại sau!</p>
                <a href="/manage/dashboard" className="back-home">Về trang chủ</a>
            </div>
        </div>
    )
}

export default memo(Page500)