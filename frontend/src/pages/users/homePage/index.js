import React, { useState, useEffect, memo } from 'react';
import './style.scss';
import { hAuthor1, hAuthor2, hAuthor3, hBoxTwo, hCta1, hCta2, hCta3, hShape1, hShape2, hShape3, hShape4, hShape5, hShape6, hShape7, noImage, slide1, slide2, slide3, slide4, slide5, tourCta } from 'assets';
import SlideShow from 'component/users/home/SlideShow.js';
import SearchForm from 'component/users/home/SearchForm.js';
import AnimatedCounter from 'component/counter';
import { Link } from 'react-router-dom';
import { TourApi } from 'services';
import formatNumberShort from 'utils/formatNumberShort.js';
import formatCurrency from 'utils/formatCurrency.js';

const slides = [slide1, slide2, slide3, slide4, slide5];

const HomePage = () => {
    const [hotTours, setHotTours] = useState([]);
    const [popularTours, setPopularTours] = useState([]);

    useEffect(() => {
        const fetchHotTour = async () => {
            try {
                const response = await TourApi.getHot();

                if (response?.code === 1515) {
                    setHotTours(response?.result);
                }
            } catch(error) {
                console.error("Failed to fetch hot tour: ", error);
            }
        }

        fetchHotTour();
    }, [])

    useEffect(() => {
        const fetchPopularTour = async () => {
            try {
                const response = await TourApi.popular();

                if (response?.code === 1507) {
                    setPopularTours(response?.result);
                }
            } catch(error) {
                console.error("Failed to fetch popular tour: ", error);
            }
        }

        fetchPopularTour();
    }, [])

    return (
        <div className="home-page">
            <SlideShow slides={slides} interval={3000} />

            <SearchForm />

            <div className="space-custom bgc-black"></div>

            <section className="destinations-area bgc-black pt-90 pb-80">
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-lg-12">
                            <div className="section-title text-white text-center counter-text-wrap mb-70" data-aos="fade-up"
                                data-aos-duration="1500" data-aos-offset="50">
                                <h2>Khám phá kho báu việt nam cùng Sao Việt</h2>
                                <p>Website<AnimatedCounter end={345} duration={2} className="plus mx-2" />tours xu hướng được yêu thích</p>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center hot-tour">
                        {hotTours.length > 0 && 
                            hotTours.map((item, index) => (
                                <div key={index} className="col-xxl-3 col-xl-4 col-md-6">
                                    <div className="destination-item block_tours" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                                        <div className="image">
                                            <span className="badge">HOT</span>
                                            <img src={item.image ? item.image : noImage} alt="tour-image" />
                                        </div>

                                        <div className="content equal-content-fix">
                                            <div className="destination-header">
                                                <span className="location">
                                                    <i className="fal fa-map-marker-alt"></i> {item.destination}
                                                </span>

                                                <div className="ratting">
                                                    {[...Array(5)].map((_, i) =>
                                                        i < item.rating ? (
                                                            <i key={i} className="fas fa-star"></i>
                                                        ) : (
                                                            <i key={i} className="far fa-star"></i>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            <h6 className="fw-bold mb-2">{item.name}</h6>
                                            <ul className="blog-meta">
                                                <li><i className="far fa-clock"></i> {item.quantityDay} ngày {item.quantityDay-1} đêm</li>
                                                <li><i className="far fa-user"></i> {item.people}</li>
                                            </ul>
                                            <div className="destination-footer">
                                                <span className="price">
                                                    <span>{formatCurrency(item.adultPrice)}</span> / người
                                                </span>
                                                <Link to={`/tour/detail/${item.id}`} className="theme-btn style-two style-three" style={{ color: "white"}}>
                                                    <i className="fal fa-arrow-right ms-0"></i>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </section>

            <section className="about-us-area py-100 rpb-90 rel z-1">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-5 col-lg-6">
                            <div className="about-us-content rmb-55" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                                <div className="section-title mb-25">
                                    <h2>Du lịch với sự tự tin lý do hàng đầu để chọn công ty chúng tôi</h2>
                                </div>
                                <p className="text-indent">Chúng tôi sẽ nỗ lực hết mình để biến giấc mơ du lịch của bạn thành hiện thực những viên ngọc ẩn
                                    và những điểm tham quan không thể bỏ qua...</p>
                                <div className="divider counter-text-wrap mt-45 mb-55">
                                    <span>
                                        Chúng tôi có <span><AnimatedCounter end={5} className="plus" /> năm</span> kinh nghiệm
                                    </span>
                                </div>
                                <div className="row">
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
                                <Link to="/destinations/index" className="theme-btn mt-10 style-two">
                                    <span data-hover="Khám phá Điểm đến">Khám phá điểm đến</span>
                                    <i className="fal fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-xl-7 col-lg-6" data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50">
                            <div className="about-us-image">
                                <div className="shape">
                                    <img src={hShape1} alt="Shape" />
                                </div>
                                <div className="shape">
                                    <img src={hShape2} alt="Shape" />
                                </div>
                                <div className="shape">
                                    <img src={hShape3} alt="Shape" />
                                </div>
                                <div className="shape">
                                    <img src={hShape4} alt="Shape" />
                                </div>
                                <div className="shape">
                                    <img src={hShape5} alt="Shape" />
                                </div>
                                <div className="shape">
                                    <img src={hShape6} alt="Shape" />
                                </div>
                                <div className="shape">
                                    <img src={hShape7} alt="Shape" />
                                </div>
                                <img src={tourCta} alt="About" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="popular-destinations-area rel z-1">
                <div className="container-fluid">
                    <div className="popular-destinations-wrap br-20 bgc-lighter pt-100 pb-70">
                        <div className="row justify-content-center">
                            <div className="col-lg-12">
                                <div className="section-title text-center counter-text-wrap mb-70" data-aos="fade-up"
                                    data-aos-duration="1500" data-aos-offset="50">
                                    <h2>Khám phá các tours phổ biến</h2>
                                    <p>Website<AnimatedCounter end={567} duration={2} className="plus mx-2" />tours phổ biến nhất</p>
                                </div>
                            </div>
                        </div>
                        <div className="container">
                            <div className="row justify-content-center">
                                {popularTours.length > 0 && (
                                    popularTours.map((item, index) => {
                                        return (
                                            <div key={index} className={`col-md-6 item ${index === 2 || index === 3 ? '' : 'col-xl-3'}`}>
                                                <Link to={`/tour/detail/${item.id}`}>
                                                    <div className="destination-item style-two" data-aos-duration="1500" data-aos-offset="50">
                                                        <div className="image img-custom">
                                                            <span className="badge">Popular</span>
                                                            <span className="order">
                                                                <i className="fas fa-ticket-alt me-1"></i>
                                                                <span>{formatNumberShort(item.bookingCount)}</span>
                                                            </span>
                                                            <img src={item.image[0] ?? noImage} alt="tour-image" />
                                                        </div>
                                                        <div className="content">
                                                            <h6 className="tour-title fw-bold">{item.name}</h6>
                                                            <span className="time">{item.quantityDay} ngày {item.quantityDay-1} đêm</span>
                                                            <i className="fas fa-chevron-right ms-2"></i>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="features-area pt-100 pb-45 rel z-1">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-6">
                            <div className="features-content-part mb-55" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                                <div className="section-title mb-60">
                                    <h2>Trải nghiệm du lịch tuyệt đỉnh mang đến sự khác biệt cho công ty chúng tôi</h2>
                                </div>
                                <div className="features-customer-box">
                                    <div className="image">
                                        <img src={hBoxTwo} alt="Features" />
                                    </div>
                                    <div className="content">
                                        <div className="feature-authors mb-15">
                                            <img src={hAuthor1} alt="Author" />
                                            <img src={hAuthor2} alt="Author" />
                                            <img src={hAuthor3} alt="Author" />
                                            <span>4k+</span>
                                        </div>

                                        <h6>5K+ Khách hàng hài lòng</h6>
                                        <div className="divider style-two counter-text-wrap my-25">
                                            <span><AnimatedCounter end={5} className="plus" /> năm</span>
                                        </div>
                                        <p>Chúng tôi tự hào cung cấp các hành trình được cá nhân hóa.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6" data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50">
                            <div className="row pb-25">
                                <div className="col-md-6">
                                    <div className="feature-item">
                                        <div className="icon"><i className="flaticon-tent"></i></div>
                                        <div className="content">
                                            <h5><Link to="#">Chinh phục cảnh quan Việt Nam</Link></h5>
                                            <p>Khám phá những cảnh đẹp hùng vĩ và tuyệt vời của đất nước Việt Nam.</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <div className="icon"><i className="flaticon-tent"></i></div>
                                        <div className="content">
                                            <h5><Link to="#">Trải nghiệm đặc sắc Việt Nam</Link></h5>
                                            <p>Trải nghiệm những hoạt động và lễ hội đặc trưng của văn hóa Việt.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="feature-item mt-20">
                                        <div className="icon"><i className="flaticon-tent"></i></div>
                                        <div className="content">
                                            <h5><Link to="#">Khám phá di sản Việt Nam</Link></h5>
                                            <p>Khám phá các di sản thế giới và những kỳ quan thiên nhiên nổi tiếng.</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <div className="icon"><i className="flaticon-tent"></i></div>
                                        <div className="content">
                                            <h5><Link to="#">Vẻ đẹp thiên nhiên Việt Nam</Link></h5>
                                            <p>Chinh phục vẻ đẹp tự nhiên hoang sơ và kỳ vĩ của Việt Nam.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-area pt-100 rel z-1">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xl-4 col-md-6" data-aos="zoom-in-down" data-aos-duration="1500" data-aos-offset="50">
                            <div className="cta-item" style={{backgroundImage: `url(${hCta1})`}}>
                                <span className="category">Khám phá vẻ đẹp văn hóa Việt</span>
                                <h2>Tìm hiểu những giá trị văn hóa độc đáo của các vùng miền Việt Nam.</h2>
                                <Link to="/tour/index" className="theme-btn style-two bgc-secondary">
                                    <span data-hover="Khám phá">Khám phá</span>
                                    <i className="fal fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-xl-4 col-md-6" data-aos="zoom-in-down" data-aos-delay="50" data-aos-duration="1500" data-aos-offset="50">
                            <div className="cta-item" style={{backgroundImage: `url(${hCta2})`}}>
                                <span className="category">Bãi biển</span>
                                <h2>Bãi trong xanh dạt dào ở Việt Nam</h2>
                                <Link to="/tour/index" className="theme-btn style-two bgc-secondary">
                                    <span data-hover="Khám phá">Khám phá</span>
                                    <i className="fal fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-xl-4 col-md-6" data-aos="zoom-in-down" data-aos-delay="100" data-aos-duration="1500" data-aos-offset="50">
                            <div className="cta-item" style={{backgroundImage: `url(${hCta3})`}}>
                                <span className="category">Thác nước</span>
                                <h2>Thác nước lớn nhất Việt Nam</h2>
                                <Link to="/tour/index" className="theme-btn style-two bgc-secondary">
                                    <span data-hover="Khám phá">Khám phá</span>
                                    <i className="fal fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default memo(HomePage);