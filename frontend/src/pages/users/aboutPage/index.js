import { memo } from 'react';
import { Link } from 'react-router-dom';
import { aboutBanner, aboutFeature1, aboutFeature2, aboutFeature3, pShape1 } from 'assets';
import AnimatedCounter from 'components/counter';
import Banner from 'components/banner';

const AboutPage = () => {
    return (
        <div className='about-page'>

            <Banner title={"Giới thiệu"} image={aboutBanner} />

            <section className="about-area-two pt-50 pb-100 rel z-1">
                <div className="container">
                    <div className="row justify-content-between">
                        <div className="col-xl-3" data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50">
                            <span className="subtitle mb-35">Về chúng tôi</span>
                        </div>
                        <div className="col-xl-9">
                            <div className="about-page-content" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                                <div className="row">
                                    <div className="col-lg-8 me-lg-5">
                                        <div className="section-title mb-25">
                                            <h2>Kinh nghiệm và công ty du lịch chuyên nghiệp ở Việt Nam</h2>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="experience-years rmb-20">
                                            <span className="title bgc-secondary">Năm kinh nghiệm</span>
                                            <span className="text">Chúng tôi có </span>
                                            <span className="years">5+</span>
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <p className="text-indent">Chúng tôi chuyên tạo ra những trải nghiệm thành phố khó quên cho du khách muốn khám phá
                                            trái tim và tâm hồn của cảnh quan đô thị. Các tour du lịch có hướng dẫn viên chuyên
                                            nghiệp của chúng tôi sẽ đưa du khách qua
                                            những con phố sôi động, các địa danh lịch sử và những viên ngọc ẩn giấu của mỗi thành
                                            phố.
                                        </p>
                                        <ul className="list-style-two mt-35">
                                            <li>Cơ quan trải nghiệm</li>
                                            <li>Đội ngũ chuyên nghiệp</li>
                                            <li>Du lịch chi phí thấp</li>
                                            <li>Hỗ trợ trực tuyến 24/7</li>
                                        </ul>
                                        <Link to="/tour/index" className="theme-btn style-three mt-30">
                                            <span data-hover="Khám phá Tours">Khám phá Tours</span>
                                            <i className="fal fa-arrow-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-features-area">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-4 col-md-6">
                            <div className="about-feature-image" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                                <img src={aboutFeature1} alt="About" />
                            </div>
                        </div>
                        <div className="col-xl-4 col-md-6">
                            <div className="about-feature-image" data-aos="fade-up" data-aos-delay="50" data-aos-duration="1500"
                                data-aos-offset="50">
                                <img src={aboutFeature2} alt="About" />
                            </div>
                        </div>
                        <div className="col-xl-4 col-md-8">
                            <div className="about-feature-boxes" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1500"
                                data-aos-offset="50">
                                <div className="feature-item style-three bgc-secondary">
                                    <div className="icon-title">
                                        <div className="icon"><i className="flaticon-award-symbol"></i></div>
                                        <h5><Link to="#">Chúng tôi là công ty đạt giải thưởng</Link></h5>
                                    </div>
                                    <div className="content">
                                        <p className="text-indent">Tại Pinnacle Business Solutions cam kết về sự xuất sắc và đổi mới đã đạt được.</p>
                                    </div>
                                </div>
                                <div className="feature-item style-three bgc-primary">
                                    <div className="icon-title">
                                        <div className="icon"><i className="flaticon-tourism"></i></div>
                                        <h5><Link to="#">200+ Điểm đến du lịch phổ biến</Link></h5>
                                    </div>
                                    <div className="content">
                                        <p className="text-indent">Đội ngũ chuyên gia của chúng tôi tận tâm phát triển các chiến lược tiên tiến thúc đẩy
                                            thành công.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-us-area pt-70 pb-100 rel z-1">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-5 col-lg-6">
                            <div className="about-us-content rmb-55" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                                <div className="section-title mb-25">
                                    <h2>Du lịch với sự tự tin lý do hàng đầu để chọn công ty của chúng tôi</h2>
                                </div>
                                <p className="text-indent">Chúng tôi hợp tác chặt chẽ với khách hàng để hiểu rõ những thách thức và mục tiêu, cung
                                    cấp các giải pháp tùy chỉnh để nâng cao hiệu quả, tăng lợi nhuận và thúc đẩy tăng trưởng bền
                                    vững.</p>
                                <div className="row pt-25">
                                    <div className="col-6">
                                        <div className="counter-item counter-text-wrap">
                                            <AnimatedCounter end={200} className="plus" />
                                            <span className="counter-title">Điểm đến phổ biến</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="counter-item counter-text-wrap">
                                            <AnimatedCounter end={5} duration={3.5} className="k-plus" />
                                            <span className="counter-title">Khách hàng hài lòng</span>
                                        </div>
                                    </div>
                                </div>
                                <Link to="/destinations/index" className="theme-btn style-three mt-10 style-two">
                                    <span data-hover="Khám phá các điểm đến">Khám phá các điểm đến</span>
                                    <i className="fal fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-xl-7 col-lg-6" data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50">
                            <div className="about-us-page">
                                <img src={aboutFeature3} alt="About" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-feature-two bgc-black pt-50 pb-100 rel z-1">
                <div className="container">
                    <div className="section-title text-center text-white counter-text-wrap mb-50" data-aos="fade-up"
                        data-aos-duration="1500" data-aos-offset="50">
                        <h2>Làm thế nào để hưởng lợi từ các chuyến du lịch của chúng tôi</h2>
                        <p>Website
                            <AnimatedCounter end={345} duration={2} className="plus mx-2" />
                            phổ biến nhất kinh nghiệm bạn sẽ nhớ
                        </p>
                    </div>
                    <div className="row">
                        <div className="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                            <div className="feature-item style-two" style={{ height: "100%" }}>
                                <div className="icon"><i className="flaticon-save-money"></i></div>
                                <div className="content">
                                    <h5><Link to="#">Đảm bảo giá tốt nhất</Link></h5>
                                    <p>Cam kết giá ưu đãi nhất, giúp bạn tiết kiệm tối đa chi phí du lịch.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="50" data-aos-duration="1500" data-aos-offset="50">
                            <div className="feature-item style-two" style={{ height: "100%" }}>
                                <div className="icon"><i className="flaticon-travel-1"></i></div>
                                <div className="content">
                                    <h5><Link to="#">Điểm đến đa dạng</Link></h5>
                                    <p>Hàng nghìn điểm đến hấp dẫn, phù hợp mọi sở thích và phong cách du lịch.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1500" data-aos-offset="50">
                            <div className="feature-item style-two" style={{ height: "100%" }}>
                                <div className="icon"><i className="flaticon-booking"></i></div>
                                <div className="content">
                                    <h5><Link to="#">Đặt chỗ nhanh</Link></h5>
                                    <p>Quy trình đặt chỗ đơn giản, nhanh chóng, đảm bảo chuyến đi suôn sẻ.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="150" data-aos-duration="1500" data-aos-offset="50">
                            <div className="feature-item style-two" style={{ height: "100%" }}>
                                <div className="icon"><i className="flaticon-guidepost"></i></div>
                                <div className="content">
                                    <h5><Link to="#">Hướng dẫn du lịch tốt</Link></h5>
                                    <p>Đội ngũ hướng dẫn tận tâm, giàu kinh nghiệm, đồng hành cùng bạn mọi hành trình.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shape">
                    <img src={pShape1} alt="shape" />
                </div>
            </section>
        </div>
    )
}

export default memo(AboutPage);