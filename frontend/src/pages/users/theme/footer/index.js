import { memo } from 'react';
import { locationIcon, envelopeIcon, facebookIcon, instagramIcon, zaloIcon, logo, phoneIcon } from 'assets';
import './style.scss';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer bg-light pt-2">
        <div className="container">
            <div className="row justify-content-between text-start">
                <div className="col-lg-5 col-md-6 py-2" data-aos="fade-up" data-aos-delay="50" data-aos-duration="1500" data-aos-offset="50">
                    <h5 className="fw-bold">Sao Việt - Vivu ba miền</h5>
                    <div className="d-flex align-items-start gap-2 my-2 icon">
                        <img src={locationIcon} alt="Địa chỉ" />
                        <p className="mb-0">1 Hoàng Công Chất, Phú Diễn, Bắc Từ Liêm, Hà Nội</p>
                    </div>
                    <div className="d-flex align-items-start gap-2 my-2 icon">
                        <img src={phoneIcon} alt="Số điện thoại" />
                        <p className="mb-0">0399.999.999</p>
                    </div>
                    <div className="d-flex align-items-start gap-2 my-2 icon">
                        <img src={envelopeIcon} alt="Email" />
                        <p className="mb-0">support@saoviet.com</p>
                    </div>
                </div>

                <div className="col-lg-4 col-md-5 d-flex flex-column align-items-start py-2" data-aos="fade-up" data-aos-delay="50" data-aos-duration="1500" data-aos-offset="50">
                    <div className="d-flex align-items-center gap-2 mb-3 logo">
                        <img src={logo} alt="Logo Sao Việt" />
                        <span className="fw-bold text-warning fs-5">Sao Việt</span>
                    </div>
                    <Link to="#" className="text-info text-decoration-none mb-2">Tuyển dụng</Link>
                    <Link to="#" className="text-info text-decoration-none mb-2">Chính sách bảo mật</Link>
                    <Link to="#" className="text-info text-decoration-none mb-2">Điều khoản sử dụng</Link>
                    <Link to="#" className="text-info text-decoration-none mb-2">Liên hệ hợp tác</Link>
                    <Link to="#" className="text-info text-decoration-none mb-2">Câu hỏi thường gặp</Link>
                </div>

                <div className="col-lg-2 col-md-6 py-2" data-aos="fade-up" data-aos-delay="50" data-aos-duration="1500" data-aos-offset="50">
                    <h5 className="fw-bold">Liên hệ hỗ trợ</h5>
                    <div className="d-flex flex-column gap-2 mt-2">
                        <Link to="#" className="text-dark text-decoration-none d-flex align-items-center gap-2 fw-bold icon">
                            <img src={facebookIcon} alt="Facebook" />
                            Facebook
                        </Link>
                        <Link to="#" className="text-dark text-decoration-none d-flex align-items-center gap-2 fw-bold icon">
                            <img src={instagramIcon} alt="Instagram" />
                            Instagram
                        </Link>
                        <Link to="#" className="text-dark text-decoration-none d-flex align-items-center gap-2 fw-bold icon">
                            <img src={zaloIcon} alt="Zalo" />
                            Zalo
                        </Link>
                    </div>
                </div>
            </div>

            <hr />
            <div className="pb-1">
                <span className="fw-bold fs-7">© 2025 Sao Việt</span>
            </div>
        </div>
        </footer>
    );
};

export default memo(Footer);
