import { memo, useEffect, useState } from 'react';
import './detail.scss';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import formatCurrency from 'utils/formatCurrency';
import formatDatetime from 'utils/formatDatetime';
import { BookingApi } from 'services';
import { ErrorToast, SuccessToast } from 'component/notifi';
import { ToastContainer } from 'react-toastify';

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

    const { id } = useParams();
    const [booking, setBooking] = useState({});
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            setLoading(true);

            try {
                const response = await BookingApi.getById(id);

                if (response?.code === 1802) {
                    setBooking(response?.result);
                } else {
                    navigate("/error/404");
                }
            }
            catch (error) {
                console.error("Failed to fetch bookings: ", error);

                navigate("/error/404");
            }
            finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

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
            try {
                const response = await BookingApi.cancel(id);

                if (response.code === 1803) {
                    SuccessToast("Lịch đặt đã được hủy thành công.");

                    setBooking((prev) =>
                        ({ ...prev, status: "Đã hủy" })
                    );
                } else {
                    ErrorToast(response.message || "Hủy lịch đặt không thành công.")
                }
            } catch (error) {
                console.log("Failed to fetch cancel: ", error);
                ErrorToast("Đã xảy ra lỗi khi hủy lịch đặt! Vui lòng thử lại sau.")
            }
        }
    };

    if (isLoading) {
        return (
            <div style={{height: 1000}}></div>
        );
    }

    return (
        <>
            <section className="calendar-detail-customer-page container mb-100">
                <div className="booking-container row">
                    <div className="booking-info col-lg-6">
                        <h2 className="booking-header">Thông tin lịch đặt</h2>
                        <div className="booking__infor">
                            <div className="form-group">
                                <p>Mã lịch đặt:</p>
                                <span>{booking.code}</span>
                            </div>

                            <div className="form-group">
                                <p>Thời gian đặt:</p>
                                <span>{booking.bookingTime ? formatDatetime(booking.bookingTime) : ''}</span>
                            </div>

                            <div className="form-group">
                                <p>Trạng thái:
                                    <span className={`ms-1 fw-normal ${statusClassMap[booking.status] || ''}`}>
                                        {booking.status}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <h2 className="booking-header mt-40">Thông tin thanh toán</h2>
                        <div className="booking__infor">
                            <div className="form-group">
                                <p>Mã giao dịch:</p>
                                <span>{booking.checkoutCode}</span>
                            </div>

                            <div className="form-group">
                                <p>Phương thức:</p>
                                <span>{booking.method}</span>
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
                            <div className="tour-infor">
                                <p>Mã Tour: <span>{booking.tourCode}</span></p>
                                <h5 className="widget-title fw-bold">{booking.tourName}</h5>
                                <p>Ngày khởi hành: <span>{booking.startDate ? formatDatetime(booking.startDate) : ''}</span></p>
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

                            {booking.status === 'Đang xử lý' && (
                                <button className="theme-btn w-100 bg-red style-two style-three" onClick={() => handleCancel(booking.id, booking.code)}>
                                    <span data-hover="Hủy">Hủy</span>
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

            <ToastContainer />
        </>
    );
};

export default memo(CalendarDetailPage);