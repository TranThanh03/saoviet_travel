import { memo } from 'react';
import './style.scss';

const Loading = () => {
    return (
        <div className="global-loader d-flex justify-content-center align-items-center position-fixed top-50 start-50 translate-middle">
            <div className="global-loader-custom spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )
}

export default memo(Loading)