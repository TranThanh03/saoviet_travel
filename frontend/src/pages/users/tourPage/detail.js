import { memo, useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import './detail.scss';
import { AuthApi, TourApi } from 'services';
import formaterCurrency from 'utils/formatCurrency';
import { sanitizeHtml } from 'utils/sanitizeHtml';
import { noImage } from 'assets';
import ReviewList from "component/users/review/index";
import CalendarCustom from "component/users/calendar/index";
import formatDatetime from 'utils/formatDatetime';
import { ErrorToast } from 'component/notifi';
import { ToastContainer } from 'react-toastify';
import getToken from 'utils/getToken';

const TourDetailPage = () => {
    const { id } = useParams();
    const [tour, setTour] = useState({});
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const [iShow, setIsShow] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [similarTours, setSimilarTours] = useState([])
    const [data, setData] = useState({
        id: "",
        startDate: "",
        endDate: "",
        adultPrice: 0,
        childrenPrice: 0,
        quantityPeople: 0,
        totalPeople: 0
    });

    const handleDateSelect = (data) => {
        setData(data);
    };

    const handleClose = () => {
        setIsShow(false);
    };
    
    useEffect(() => {
        const fetchTour = async () => {
            setIsLoading(true);
            
            try {
                const response = await TourApi.getById(id);

                if (response?.code === 1502) {
                    setTour(response?.result);
                } else {
                    navigate("/error/404");
                }
            } catch (error) {
                console.error("Failed to fetch tour: ", error);
                navigate("/error/404");
            } finally {
                setIsLoading(false);
            }
        }

        fetchTour();
    }, [id])

    useEffect(() => {
        const fetchSimilarTours = async () => {
            try {
                const response = await TourApi.getSimilar({ id: id , destination: tour.destination, day: tour.quantityDay });

                if (response?.code === 1512) {
                    setSimilarTours(response?.result);
                }
            } catch (error) {
                console.error("Failed to fetch similar tours: ", error);
            }
        }

        if (id && tour.destination && tour.quantityDay) {
            fetchSimilarTours();
        }
    }, [id, tour.destination, tour.quantityDay])

    const handleBooking = async () => {
        try {
            const token = getToken();

            if (token) {
                const response = await AuthApi.introspect();

                if (response?.code === 9998 && response?.result) {
                    if (data.startDate !== '' && data.id !== '') {
                        navigate(`/booking/${data.id}`);
                    } else {
                        ErrorToast("Vui lòng chọn ngày khởi hành trước.");
                    }
                }
            } else {
                ErrorToast("Vui lòng đăng nhập để đặt tour.");
                
                setTimeout(() => {
                    navigate("/auth/login");
                }, 1500);
            }
        } catch (error) {
            console.error("Failed to fetch schedule: ", error);

            if (error.request?.status === 401) {
                ErrorToast("Vui lòng đăng nhập để đặt tour.");

                setTimeout(() => {
                    navigate("/auth/login");
                }, 1500);
            } else {
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.");
            }
        }
    }

    if (isLoading) {
        return (
            <div style={{ height: 1000 }}></div>
        );
    }

    return (
        <div className="tour-detail-page">
            <div className="tour-gallery">
                <div className="container-fluid">
                    <div className="row gap-10 justify-content-center rel img-custom">
                        {tour.image && tour.image.length > 0 && (
                            Array.from({ length: 4 }).map((_, index) => {
                                const item = tour.image[index % tour.image.length];

                                return (
                                    <div className={`${index === 0 || index === 3 ? 'col-lg-6' : 'col-lg-4'} col-md-6`} key={index} 
                                        data-aos="fade-up" data-delay="2000" data-aos-duration="1500" data-aos-offset="50">

                                        <div className="gallery-item">
                                            <img src={item ?? noImage} alt="tour-image" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <section className="tour-header-area pt-40 rel z-1">
                <div className="container">
                    <div className="row justify-content-between">
                        <div className="col-xl-6 col-lg-7">
                            <div className="tour-header-content mb-15" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                                <span className="location">
                                    <span><i className="fal fa-map-marker-alt me-1"></i>{tour.destination}</span>
                                    <span className="quantity-order"><i className="far fa-ticket-alt me-1"></i>{tour.quantityOrder}</span>
                                </span>
                                <div className="section-title pb-5 mt-1">
                                    <h2>{tour.name}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-5 text-lg-end" data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50">
                            <div className="tour-header-social mb-10">
                                <Link to="#"><i className="far fa-share-alt"></i>Share tours</Link>
                                <Link to="#"><i className="fas fa-heart bgc-secondary"></i>Wish list</Link>
                            </div>
                        </div>
                    </div>
                    <hr className="mt-50 mb-70" />
                </div>
            </section>

            <section className="tour-details-page pb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-7">
                            <div className="tour-details-content">
                                <h3>Khám phá Tours</h3>
                                <p className="description" dangerouslySetInnerHTML={{ __html: sanitizeHtml(tour.description || '') }}></p>
                                <div className="row pb-55">
                                    <div className="col-md-6" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                                        <div className="tour-include-exclude mt-30">
                                            <h5>Bao gồm</h5>
                                            <ul className="list-style-one check mt-25">
                                                <li><i className="far fa-check"></i> Dịch vụ đón và trả khách</li>
                                                <li><i className="far fa-check"></i> Một bữa ăn mỗi ngày</li>
                                                <li><i className="far fa-check"></i> Vé máy bay/vé tàu/vé tham quan (nếu có)</li>
                                                <li><i className="far fa-check"></i> Nước đóng chai trên xe buýt</li>
                                                <li><i className="far fa-check"></i> Hướng dẫn viên du lịch</li>
                                                <li><i className="far fa-check"></i> Bảo hiểm du lịch</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-md-6" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                                        <div className="tour-include-exclude mt-30">
                                            <h5>Không bao gồm</h5>
                                            <ul className="list-style-one mt-25">
                                                <li><i className="far fa-times"></i> Chi phí ăn uống, tham quan ngoài chương trình</li>
                                                <li><i className="far fa-times"></i> Đón và trả khách tại khách sạn</li>
                                                <li><i className="far fa-times"></i> Chi phí làm hộ chiếu, visa (nếu có)</li>
                                                <li><i className="far fa-times"></i> Thuế VAT</li>
                                                <li><i className="far fa-times"></i> Tiền tip cho hướng dẫn viên, tài xế</li>
                                                <li><i className="far fa-times"></i> Dịch vụ bổ sung</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h3>Lịch trình</h3>
                            <div className="accordion-two mt-25 mb-60" id="faq-accordion-two">
                               {tour.itinerary && tour.itinerary.length > 0 && (
                                    tour.itinerary.map((item, index) => (
                                        <div key={index} className="accordion-item">
                                            <h5 className="accordion-header">
                                                <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target={`#collapseTwo${item.dayNumber}`}>
                                                    <span className="fw-bold">Ngày {item.dayNumber}: {item.title}</span>
                                                </button>
                                            </h5>
                                            <div id={`collapseTwo${item.dayNumber}`} className="accordion-collapse collapse" data-bs-parent="#faq-accordion-two">
                                                <div className="accordion-body">
                                                    <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description || '') }}></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <ReviewList tourId={id} bookingId={bookingId}/>
                        </div>    

                        <div className="col-lg-5 col-md-8 col-sm-10">
                            <div className="blog-sidebar tour-sidebar" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                                <CalendarCustom
                                    tourId={id}
                                    onDateSelect={handleDateSelect}
                                    isShow={iShow}
                                    onClose={handleClose}
                                />

                                <div className="widget widget-booking">
                                    <h5 className="widget-title fw-bold text-center">Đặt Tour</h5>
                                    <div className="form-custom">
                                        <div className="date">
                                            <b>Ngày khởi hành:</b>
                                            <div className="date-input">
                                                <i className="fa-solid fa-calendar-days cursor-pointer" onClick={() => setIsShow(true)}></i>
                                                <input type="text" value={data.startDate ? formatDatetime(data.startDate) : ""} disabled />
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="date">
                                            <b>Ngày kết thúc:</b>
                                            <div className="date-input">
                                                <i className="fa-solid fa-calendar-days"></i>
                                                <input type="text" value={data.endDate ? formatDatetime(data.endDate) : ""} disabled />
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="time py-5">
                                            <b>Thời gian :</b>
                                            <p id="p-custom">{tour.quantityDay ? `${tour.quantityDay} ngày ${tour.quantityDay-1} đêm` : ''}</p>
                                        </div>
                                        <hr className="mb-25" />
                                        <h6 className="fw-bold">Vé:</h6>
                                        <ul className="tickets clearfix">
                                            <li>
                                                Người lớn: <span className="price">{formaterCurrency(data.adultPrice)}</span>
                                            </li>
                                            <li>
                                                Trẻ em: <span className="price">{formaterCurrency(data.childrenPrice)}</span>
                                            </li>
                                            <li>
                                                Còn nhận: <span className="people">
                                                            {data.totalPeople - data.quantityPeople}<i className="far fa-user ms-1"></i>
                                                        </span>
                                            </li>
                                        </ul>
                                        <button type="button" className="theme-btn style-two w-100 mt-25 mb-5" onClick={handleBooking}>
                                            <span data-hover="Đặt ngay">Đặt ngay</span>
                                            <i className="fal fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>

                                {similarTours.length > 0 && (
                                    <div className="widget widget-tour" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                                        <h6 className="widget-title  fw-bold">Tours tương tự</h6>
                                        {similarTours.map((item, index) => (
                                            <div key={index} className="destination-item tour-grid style-three bgc-lighter">
                                                <div>
                                                    <img className="image-similar" src={item.image[0] || noImage} alt="Tour" />
                                                </div>
                                                <div className="content">
                                                    <div className="destination-header">
                                                        <span className="location">
                                                            <i className="fal fa-map-marker-alt"></i>
                                                            {item.destination}
                                                        </span>
                                                        <span className="location">
                                                            <i className="far fa-clock me-1"></i>
                                                            <span>{item.quantityDay ? `${item.quantityDay} ngày ${item.quantityDay-1} đêm` : ''}</span>
                                                        </span>
                                                    </div>
                                                    <h6 className="fw-bold">
                                                        <Link to={`/tour/detail/${item.id}`}>{item.name}</Link>
                                                    </h6>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ToastContainer />
        </div>
    )
}

export default memo(TourDetailPage);