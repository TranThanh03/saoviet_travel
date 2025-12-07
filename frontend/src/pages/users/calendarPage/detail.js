import { memo, useEffect, useState } from 'react';
import './detail.scss';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import formatCurrency from 'utils/formatCurrency.js';
import formatDatetime from 'utils/formatDatetime.js';
import { BookingApi, PaymentApi } from 'services';
import { ErrorToast, SuccessToast } from 'components/notifi';
import { FaArrowLeft } from 'react-icons/fa';
import Countdown from 'components/users/countdown';

const CalendarDetailPage = () => {
    const statusClassMap = {
        'Đang xử lý': 'pending',
        'Đã xác nhận': 'confirm',
        'Đã hủy': 'cancel'
    };
    const checkoutStatusClassMap = {
        "Đã thanh toán": "paid",
        "Chưa thanh toán": "unpaid",
    };
    const paymentOptions = [
        { value: 'momo', label: 'MoMo'},
        { value: 'vnpay', label: 'VNPay'}
    ];

    const { id } = useParams();
    const [booking, setBooking] = useState({});
    const navigate = useNavigate();
    const [method, setMethod] = useState('');
    const [isLoading, setIsLoading] = useState({
        payment: false,
        cancel: false,
    });

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await BookingApi.getById(id);

                if (response?.code === 1805) {
                    const data = response?.result;

                    setBooking({
                        ...data,
                        isValidTime: new Date(data.expiredTime).getTime() - Date.now() > 0
                    });
                    setMethod(response?.result?.method.toLowerCase());
                } else {
                    navigate("/error/404");
                }
            }
            catch (error) {
                console.error("Failed to fetch bookings: ", error);
                navigate("/error/404");
            }
        };

        fetchBooking();
    }, [id]);

    const handleCountdownExpire = () => {
        setBooking(prev => ({ ...prev, isValidTime: false }));
    };

    const handleRetryPayment = async () => {
        setIsLoading(prev => ({ ...prev, payment: true }));

        try {
            const response = await PaymentApi.retry({ 'bookingId': booking.id, method });

            if (response?.code === 2304 ||response?.code === 2305) {
                window.location.href = response?.result?.checkoutUrl;
            } else {
                ErrorToast(response?.message);
                setIsLoading(prev => ({ ...prev, payment: false }));
            }
        } catch (error) {
            console.error("Failed to retry payment: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            setIsLoading(prev => ({ ...prev, payment: false }));
        }
    };

    const handleCancel = async (id, code) => {
        const result = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn muốn hủy lịch đặt <b>${code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
            setIsLoading(prev => ({ ...prev, cancel: true }));

            try {
                const response = await BookingApi.cancel(id);

                if (response.code === 1806) {
                    SuccessToast(`Lịch đặt ${code} đã được hủy thành công.`);

                    setBooking((prev) => ({   
                        ...prev,
                        status: "Đã hủy",
                        expiredTime: null
                    }));
                } else {
                    ErrorToast(response.message || `Hủy lịch đặt ${code} không thành công.`)
                }
            } catch (error) {
                console.error("Failed to fetch cancel: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            } finally {
                setIsLoading(prev => ({ ...prev, cancel: false }));
            }
        }
    };

    return (
        <section className="calendar-detail-customer-page container mb-100">
            <div className="btn-back">
                <button type="button" className="bg-white p-0 fw-bold"
                    onClick={() => {
                        navigate("/calendar/index");
                    }}
                >
                    <FaArrowLeft className="mx-2"/>Quay lại danh sách
                </button>
            </div>

            <div className="booking-container row">
                <div className="booking-info col-lg-6 m-1">
                    <div className="booking-header">
                        <h2 className="title">Thông tin lịch đặt</h2>
                        {booking.expiredTime && (
                            <p className={`notifi ${booking.isValidTime ? 'success-notifi' : 'error-notifi'}`}>
                                {booking.method === 'Tiền mặt' ? (
                                    <>
                                        {booking.isValidTime ? (
                                            <>
                                                Vui lòng thanh toán trước {formatDatetime(booking.expiredTime)}
                                            </>
                                        ) : (
                                            <>
                                                Đã hết thời gian thanh toán
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {booking.isValidTime ? (
                                            <>
                                                Thanh toán trong <Countdown expiredTime={booking.expiredTime} onExpire={() => handleCountdownExpire()}/>
                                            </>
                                        ) : (
                                            <>
                                                Đã hết thời gian thanh toán
                                            </>
                                        )}
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                    <div className="booking__infor user_info">
                        <div className="form-group">
                            <p>Mã lịch đặt:</p>
                            <span>{booking.code}</span>
                        </div>

                        <div className="form-group">
                            <p>Thời gian đặt:</p>
                            <span>{booking.bookingTime ? formatDatetime(booking.bookingTime) : ''}</span>
                        </div>

                        <div className="form-group">
                            <p>Trạng thái:</p>
                            <span className={`ms-1 fw-normal ${statusClassMap[booking.status] || ''}`}>
                                {booking.status}
                            </span>
                        </div>
                    </div>

                    <h2 className="title mt-30">Thông tin thanh toán</h2>
                    <div className="booking__infor">
                        <div className="form-group">
                            <p>Mã giao dịch:</p>
                            <span>{booking.checkoutCode}</span>
                        </div>

                        <div className="form-group">
                            <p>Phương thức:</p>

                            {booking.expiredTime && booking.isValidTime && booking.method !== 'Tiền mặt' ? (
                                <select
                                    className="form-control-method"
                                    value={method || booking.method.toLowerCase()}
                                    onChange={(e) => setMethod(e.target.value)}
                                >
                                    {paymentOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span>{booking.method}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <p>Thời gian:</p>
                            <span>{booking.checkoutTime ? formatDatetime(booking.checkoutTime) : ''}</span>
                        </div>

                        <div className="form-group">
                            <p>Trạng thái:</p>
                            <span className={`${checkoutStatusClassMap[booking.checkoutStatus] || ''}`}>
                                {booking.checkoutStatus}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="booking-summary col-lg-5">
                    <div className="summary-section">
                        <div className="tour-info">
                            <p>Mã tour: <span>{booking.tourCode}</span></p>
                            <Link to={`/tour/detail/${booking.tourId}`} className="title fw-bold">{booking.tourName}</Link>
                            <p style={{ marginTop: '1rem' }}>Ngày khởi hành: <span>{booking.startDate ? formatDatetime(booking.startDate) : ''}</span></p>
                            <p>Ngày kết thúc: <span>{booking.endDate ? formatDatetime(booking.endDate) : ''}</span></p>
                            <p>Thời gian: <span>{booking.quantityDay ? `${booking.quantityDay} ngày ${booking.quantityDay-1} đêm` : ''}</span></p>
                        </div>

                        <div className="order-summary">
                            <div className="summary-item">
                                <span>Người lớn:</span>
                                <div>
                                    <span className="quantity__adults">{booking.quantityAdult}</span>
                                    <span className="mx-1">x</span>
                                    <span className="total-price">{booking.adultPrice ? formatCurrency(booking.adultPrice) : 0}</span>
                                </div>
                            </div>
                            <div className="summary-item">
                                <span>Trẻ em:</span>
                                <div>
                                    <span className="quantity__children">{booking.quantityChildren}</span>
                                    <span className="mx-1">x</span>
                                    <span className="total-price">{booking.childrenPrice ? formatCurrency(booking.childrenPrice): 0}</span>
                                </div>
                            </div>
                            <div className="summary-item">
                                <span>Giảm giá:</span>
                                <div>
                                    <span className="total-price">{formatCurrency(booking.discount)}</span>
                                </div>
                            </div>
                            <div className="summary-item">
                                <span className="fw-bold">Tổng cộng:</span>
                                <span id="total-cost">{formatCurrency(booking.totalPrice)}</span>
                            </div>
                        </div>

                        {booking.status === 'Đang xử lý' && booking.expiredTime !== null && booking.isValidTime && booking.method !== 'Tiền mặt' && (
                            <button 
                                className={`theme-btn w-100 style-two style-three mb-3 ${isLoading.payment ? 'inactive' : ''}`}
                                disabled={isLoading.payment}
                                style={{ backgroundColor: "rgb(255 193 7)"}}
                                onClick={() => handleRetryPayment()}
                            >
                                <span data-hover="Thanh toán">
                                    {isLoading.payment ? 
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        : 'Thanh toán'
                                    }
                                </span>
                            </button>
                        )}

                        {booking.status === 'Đang xử lý' && (
                            <button
                                className={`theme-btn w-100 bg-red style-two style-three ${isLoading.cancel ? 'inactive-cancel' : ''}`}
                                disabled={isLoading.cancel}
                                onClick={() => handleCancel(booking.id, booking.code)}
                            >
                                <span data-hover="Hủy">
                                    {isLoading.cancel ? 
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        : 'Hủy'
                                    }
                                </span>
                            </button>
                        )}

                        {booking.reviewed && (
                            <Link to={`/tour/detail/${booking.tourId}?bookingId=${booking.id}`} className="theme-btn w-100 bg-yellow style-two style-three">
                                <span data-hover="Đánh giá">Đánh giá</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default memo(CalendarDetailPage);