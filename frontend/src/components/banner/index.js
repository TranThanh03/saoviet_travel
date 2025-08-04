import { memo } from 'react';
import "./index.scss";

const Banner = ({ title, image }) => {
    return (
        <section className="banner-custom page-banner-area mt-1 pt-50 rel z-1 bgs-cover" style={{ backgroundImage: `url(${image})` }}>
            <div className="container">
                <div className="banner-inner text-white">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center" data-aos="fade-right" data-aos-delay="200" data-aos-duration="1500" data-aos-offset="50">
                            <li className="breadcrumb-item">Trang chủ</li>
                            <li className="breadcrumb-item active">{title}</li>
                        </ol>
                    </nav>
                </div>
            </div>
        </section>
    );
};

export default memo(Banner);