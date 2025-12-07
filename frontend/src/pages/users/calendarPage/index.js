import { memo, useEffect, useState } from 'react';
import './index.scss';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import formatCurrency from 'utils/formatCurrency.js';
import formatDatetime from 'utils/formatDatetime.js';
import { noImage } from 'assets';
import { BookingApi } from 'services';
import { ErrorToast, SuccessToast } from 'components/notifi';
import Countdown from 'components/users/countdown';
import { useAuth } from 'utils/AuthContext';

const CalendarPage = () => {
    const statusClassMap = {
        'Đang xử lý': 'pending',
        'Đã xác nhận': 'confirm',
        'Đã hủy': 'cancel'
    };

    const [bookings, setBookings] = useState([]);
    const navigate = useNavigate();
    const [loadingId, setLoadingId] = useState(false);
    const { setBookingCount } = useAuth();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await BookingApi.getByCustomerId();

                if (response?.code === 1804) {
                    const data = response?.result.map(b => ({
                        ...b,
                        isValidTime: new Date(b.expiredTime).getTime() - Date.now() > 0
                    }));

                    setBookings(data);
                }
            }
            catch (error) {
                console.error("Failed to fetch bookings: ", error);

                if (error?.status === 401) {
                    navigate("/auth/login");
                }
            }
        };

        fetchBookings();
    }, []);
    
    const handleCountdownExpire = (index) => {
        setBookingCount((prev) => prev - 1);
        setBookings(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, isValidTime: false } : item
            )
        );
    };

    const handleCancel = async (item) => {
        const id = item.id;
        const code = item.code;

        const result = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn muốn hủy lịch đặt <b>${code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
            setLoadingId(id);
            
            try {
                const response = await BookingApi.cancel(id);

                if (response.code === 1806) {
                    SuccessToast(`Lịch đặt ${code} đã được hủy thành công.`);
                    
                    if (item.expiredTime) {
                        if (item.isValidTime) {
                            setBookingCount((prev) => prev - 1);
                        }

                        setBookings((prev) => prev.filter((b) => b.id !== id));
                    } else {
                        setBookings((prev) =>
                            prev.map((b) =>
                                b.id === id
                                    ? { ...b, status: "Đã hủy", expiredTime: null }
                                    : b
                            )
                        );
                    }
                } else {
                    ErrorToast(response.message || `Hủy lịch đặt ${code} không thành công.`)
                }
            } catch (error) {
                console.error("Failed to fetch cancel: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            } finally {
                setLoadingId(null);
            }
        }
    };

    return (
        <section className="calendar-page tour-list-page pt-50 pb-100 rel z-1 min-vh-100">
            <div className="container">
                <h3 className="fw-bold mb-3">Danh sách lịch đặt</h3>
                <div className="calendar col-lg-10" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                    {bookings.length > 0 && (
                        bookings.map((item, index) => (
                            <div key={index} className={`calendar-sub style-three bgc-lighter ${item.expiredTime ? (item.isValidTime ? 'success-border' : 'error-border') : ''}`}>
                                {item.expiredTime && (
                                    <div className={`notifi ${item.isValidTime ? 'success-notifi' : 'error-notifi'}`}>
                                        {item.method === 'Tiền mặt' ? (
                                            <>
                                                {item.isValidTime ? (
                                                    <>
                                                        Vui lòng thanh toán trước {formatDatetime(item.expiredTime)}
                                                    </>
                                                ) : (
                                                    <>
                                                        Đã hết thời gian thanh toán
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {item.isValidTime ? (
                                                    <>
                                                        Thanh toán trong <Countdown expiredTime={item.expiredTime} onExpire={() => handleCountdownExpire(index)}/>
                                                    </>
                                                ) : (
                                                    <>
                                                        Đã hết thời gian thanh toán
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="destination-item style-three bgc-lighter">
                                    <div className="image">
                                        <Link to={`/tour/detail/${item.tourId}`}>
                                            <span className={`badge ${statusClassMap[item.status] || ''}`}>
                                                {item.status}
                                            </span>
                                            <img src={item.image ?? noImage} alt="Tour" />
                                        </Link>
                                    </div>
                                    <div className="content">
                                        <div className="destination-header">
                                            <div className="booking-code my-2">
                                                Mã lịch đặt:
                                                <span className="ms-2">{item.code}</span>
                                            </div>

                                            <p className="fw-bold m-0 mb-2" style={{ fontSize: '22px' }}>
                                                <Link to={`/tour/detail/${item.tourId}`}>{item.tourName}</Link>
                                            </p>
                                            
                                            <div className="booking-info">
                                                <span className="location">
                                                    <i className="fal fa-map-marker-alt"></i>
                                                    <span style={{ fontSize: '13px' }}>{item.destination}</span>
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
                                        </div>

                                        <ul className="blog-meta">
                                            <li className="w-100">
                                                <ul className="sub-meta">
                                                    <li>
                                                        <i className="fa-solid fa-calendar-days"></i>
                                                        {item.quantityDay ? `${item.quantityDay} ngày ${item.quantityDay-1} đêm` : ''}
                                                    </li>
                                                    <li style={{paddingRight: '31px'}}>
                                                        <i className="far fa-user"></i>
                                                        {item.people}
                                                    </li>
                                                </ul>
                                            </li>
                                            <li className="w-100">
                                                <ul className="sub-meta">
                                                    <li>
                                                        <i className="far fa-clock"></i>
                                                        {item.bookingTime ? formatDatetime(item.bookingTime) : ''}
                                                    </li>
                                                    <li style={{minWidth: '92px'}}>
                                                        <i className="fa-regular fa-credit-card"></i>
                                                        {item.method}
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>

                                        <div className="destination-footer">
                                            <div>
                                                <span className="price">
                                                    <span>{item.totalPrice ? formatCurrency(item.totalPrice) : 0}</span>
                                                </span>
                                            </div>

                                            {item.status === 'Đang xử lý' || item.reviewed ? (
                                                <div className="control">
                                                    {item.status === 'Đang xử lý' && (
                                                        <button
                                                            className={`theme-btn bg-red style-two style-three ${loadingId === item.id ? 'inactive-cancel' : ''}`}
                                                            disabled={loadingId === item.id}
                                                            onClick={() => handleCancel(item)}
                                                        >
                                                            <span data-hover="Hủy">
                                                                {loadingId === item.id ?
                                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                                    : 'Hủy'
                                                                }
                                                            </span>
                                                        </button>
                                                    )}

                                                    {item.reviewed && (
                                                        <Link to={`/tour/detail/${item.tourId}?bookingId=${item.id}`} className="theme-btn bg-yellow style-two style-three">
                                                            <span data-hover="Đánh giá">Đánh giá</span>
                                                        </Link>
                                                    )}

                                                    <Link to={`/calendar/detail/${item.id}`} className="theme-btn style-two style-three float-right">
                                                        <span data-hover="Chi tiết">Chi tiết</span>
                                                        <i className="fal fa-arrow-right"></i>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Link to={`/calendar/detail/${item.id}`} className="theme-btn style-two style-three float-right">
                                                        <span data-hover="Chi tiết">Chi tiết</span>
                                                        <i className="fal fa-arrow-right"></i>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default memo(CalendarPage);