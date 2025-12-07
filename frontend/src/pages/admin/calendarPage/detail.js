import { useState, useEffect, memo, useCallback } from "react";
import "./detail.scss";
import { BookingApi, PaymentApi } from "services";
import formatCurrency from "utils/formatCurrency.js";
import formatDatetime from "utils/formatDatetime.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { noImage, momo, vnpay, cash } from "assets";
import { FaArrowLeft, FaChair, FaCheck, FaCreditCard, FaTimes } from "react-icons/fa";
import { ErrorToast, SuccessToast } from "components/notifi";

const CalendarDetailPage = () => {
    const [booking, setBooking] = useState({});
    const { id } = useParams();
    const navigate = useNavigate();
    const [totalCost, setTotalCost] = useState(0);
    const [isLoading, setIsLoading] = useState({
        reserved: false,
        payment: false,
        cancel: false,
        confirm: false
    });

    const paymentClassMap = {
        "Đã thanh toán": "paid",
        "Chưa thanh toán": "unpaid",
    };
    const statusClassMap = {
        "Đã xác nhận": "confirm",
        "Đã hủy": "cancel",
        "Đang xử lý": "processing",
    };
    const methodClassMap = {
        "MoMo": momo,
        "VNPay": vnpay,
        "Tiền mặt": cash,
    }

    useEffect(() => {
        setTotalCost(booking.quantityAdult * booking.adultPrice + booking.quantityChildren * booking.childrenPrice);
    }, [booking.quantityAdult, booking.adultPrice, booking.quantityChildren, booking.childrenPrice])

    const fetchCalendar = useCallback(async () => {
        try {
            const response = await BookingApi.getDetailByAdmin(id);

            if (response?.code === 1811) {
                const data = response?.result;
                
                setBooking({
                    ...data,
                    isValidTime: new Date(data.expiredTime).getTime() - Date.now() > 0
                });
            } else {
                navigate("/manage/error/404");
            }
        }
        catch (error) {
            console.error("Failed to fetch booking: ", error);
        }
    }, [id]);

    useEffect(() => {
        fetchCalendar();
    }, [id]);

    const handleReserve = async () => {
        const result = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn giữ chỗ lịch đặt <b>${booking.code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
            setIsLoading(prev => ({ ...prev, reserved: true }));

            try {
                const response = await BookingApi.confirmReserve(id);

                if (response.code === 1809) {
                    SuccessToast("Lịch đặt đã được giữ chỗ thành công.");
                    setBooking((prev) => ({
                        ...prev,
                        reserved: true,
                    }));
                } else {
                    ErrorToast(response?.message || "Giữ chỗ lịch đặt không thành công.")
                }
            } catch (error) {
                console.error("Failed to confirm booking: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            } finally {
                setIsLoading(prev => ({ ...prev, reserved: false }));
            }
        }
    };
    
    const handlePayment = async () => {
        if (!booking.reserved) {
            ErrorToast("Vui lòng xác nhận giữ chỗ trước!");
            return;
        }

        const result = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn xác nhận thanh toán lịch đặt <b>${booking.code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
            let transCode;

            if (booking.method !== "Tiền mặt") {
                const transInput = await Swal.fire({
                    html: `<strong>Vui lòng nhập mã giao dịch</strong>`,
                    input: "text",
                    inputAttributes: {
                        inputmode: "numeric",
                        pattern: "[0-9]*"
                    },
                    showCancelButton: true,
                    confirmButtonText: "Lưu",
                    cancelButtonText: "Hủy",
                    inputValidator: (value) => {
                        if (!value) {
                            return `<span style="color: red;">Vui lòng không bỏ trống.</span>`;
                        }

                        if (!/^\d+$/.test(value)) {
                            return `<span style="color: red;">Mã giao dịch chỉ được chứa số (0–9).</span>`;
                        }
                        return null;
                    },
                    preConfirm: () => {
                        return Swal.getInput().value;
                    }
                });
                
                if (!transInput.isConfirmed) {
                    return;
                }

                transCode = transInput.value;
            }

            setIsLoading(prev => ({ ...prev, payment: true }));

            try {
                const response = await PaymentApi.confirm(booking.checkoutId, transCode);

                if (response.code === 2303) {
                    SuccessToast("Lịch đặt đã được xác nhận thanh toán thành công.");
                    setBooking((prev) => ({
                        ...prev,
                        expiredTime: null,
                        checkoutCode: transCode,
                        checkoutTime: new Date().toISOString(),
                        checkoutStatus: "Đã thanh toán",
                    }));
                } else {
                    ErrorToast(response?.message || "Xác nhận thanh toán lịch đặt không thành công.")
                }
            } catch (error) {
                console.error("Failed to confirm booking: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            } finally {
                setIsLoading(prev => ({ ...prev, payment: false }));
            }
        }
    };

    const handleCancel = async () => {
        const result = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn hủy lịch đặt <b>${booking.code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
            setIsLoading(prev => ({ ...prev, cancel: true }));

            try {
                const response = await BookingApi.cancelByAdmin(id);

                if (response?.code === 1807) {
                    SuccessToast(response?.message);
                    setBooking((prev) => ({
                        ...prev,
                        expiredTime: null,
                        reserved: true,
                        status: "Đã hủy",
                    }));
                } else {
                    ErrorToast(response?.message || "Hủy lịch đặt không thành công.");
                }
            } catch (error) {
                console.error("Failed to cancel booking: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            } finally {
                setIsLoading(prev => ({ ...prev, cancel: false }));
            }
        }
    };

    const handleConfirm = async () => {
        const result = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn xác nhận lịch đặt <b>${booking.code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
            setIsLoading(prev => ({ ...prev, confirm: true }));

            try {
                const response = await BookingApi.confirm(id);

                if (response?.code === 1808) {
                    SuccessToast(response?.message);
                    setBooking((prev) => ({
                        ...prev,
                        status: "Đã xác nhận",
                    }));
                } else {
                    ErrorToast(response?.message || "Xác nhận lịch đặt không thành công.")
                }
            } catch (error) {
                console.error("Failed to confirm booking: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            } finally {
                setIsLoading(prev => ({ ...prev, confirm: false }));
            }
        }
    };

    return (
        <div className="calendar-detail-page">
            <div className="row">
                <div className="col-md-12">
                    {booking.expiredTime && (
                        <div className={`notifi ${booking.isValidTime ? 'success-notifi' : 'error-notifi'}`}>
                            {booking.isValidTime ? (
                                <>
                                    Thanh toán trước {formatDatetime(booking.expiredTime)}
                                </>
                            ) : (
                                <>
                                    Đã hết thời gian thanh toán
                                </>
                            )}
                        </div>
                    )}

                    <div className={`x_panel ${booking.expiredTime ? (booking.isValidTime ? 'success-border' : 'error-border') : ''}`}>
                        <div className="invoice_booking">
                            <div className="x_title">
                                <h2>Hóa đơn chi tiết</h2>
                                <div className="clearfix"></div>
                            </div>

                            <div className="x_content">
                                <section className="content invoice">
                                    <div className="row">
                                        <div className="invoice-header">
                                            <h3 className="fw-bold">
                                                ✈️
                                                {booking.tourName} (
                                                <small className="mx-1 start-date">{booking.startDate ? formatDatetime(booking.startDate) : ''}</small>-
                                                <small className="mx-1 end-date">{booking.endDate ? formatDatetime(booking.endDate) : ''}</small>
                                                )
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="row invoice-info mt-2">
                                        <div className="col-sm-4 invoice-col">
                                            <i>Khách hàng:</i>
                                            <address>
                                                <strong>{booking.fullName}</strong> <br />
                                                Số điện thoại: {booking.phone} <br />
                                                Email: {booking.email}
                                            </address>
                                        </div>
                                        <div className="col-sm-4 invoice-col">
                                            <i>Đơn vị tổ chức:</i>
                                            <address>
                                                <strong>Công ty du lịch Sao Việt</strong> <br />
                                                Phone: 0399.999.999 <br />
                                                Email: support@saoviet.com
                                            </address>
                                        </div>
                                        <div className="col-sm-4 invoice-col">
                                            <i>Thông tin hóa đơn:</i>
                                            <address>
                                                <b>Mã lịch đặt: {booking.code}</b><br />
                                                Thời gian đặt: {booking.bookingTime ? formatDatetime(booking.bookingTime) : ''}<br />
                                                Trạng thái: <span className={statusClassMap[booking.status] || ''}>{booking.status}</span>
                                            </address>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="table mt-4">
                                            <table className="table table-striped" border={1}>
                                                <thead>
                                                    <tr>
                                                        <th>Đối tượng</th>
                                                        <th>Số lượng</th>
                                                        <th>Đơn giá</th>
                                                        <th>Tổng tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Người lớn</td>
                                                        <td> {booking.quantityAdult} </td>
                                                        <td> {booking.adultPrice ? formatCurrency(booking.adultPrice) : 0} </td>
                                                        <td className="color-red"> {booking.adultPrice ? formatCurrency(booking.quantityAdult * booking.adultPrice) : 0} </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Trẻ em</td>
                                                        <td> {booking.quantityChildren} </td>
                                                        <td> {booking.childrenPrice ? formatCurrency(booking.childrenPrice) : 0} </td>
                                                        <td className="color-red"> {booking.childrenPrice ? formatCurrency(booking.quantityChildren * booking.childrenPrice) : 0} </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="lead fw-bold">Thông tin thanh toán:</p>
                                            {booking.method !== "Tiền mặt" && (
                                                <p><b>Mã giao dịch: {booking.checkoutCode}</b></p>                                                   
                                            )}
                                            <p>
                                                Phương thức:
                                                <img src={methodClassMap[booking.method] || noImage} className="ms-1 image no-print" alt={methodClassMap[booking.method] || 'no-image'} />
                                                <span className="ms-1">{booking.method}</span>
                                            </p>
                                            <p>
                                                Thời gian:
                                                <span className="ms-1">{booking.checkoutTime ? formatDatetime(booking.checkoutTime) : ''}</span>
                                            </p>
                                            <p>
                                                Trạng thái:
                                                <span className={`ms-1 ${paymentClassMap[booking.checkoutStatus] || ''}`}>{booking.checkoutStatus}</span>
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="lead fw-bold">Tổng kết chi phí:</p>
                                            <div className="table-responsive">
                                                <table className="table">
                                                    <tbody>
                                                        <tr>
                                                            <th>Tổng tiền:</th>
                                                            <td>{formatCurrency(totalCost)}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>Giảm giá:</th>
                                                            <td>{booking.discount ? formatCurrency(booking.discount) : 0}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>Thành tiền:</th>
                                                            <td className="color-red fw-bold">{booking.totalPrice ? formatCurrency(booking.totalPrice) : 0}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="row no-print">
                            <div className="control">
                                <Link to="/manage/calendars">
                                    <button type="button" className="btn btn-back">
                                        <FaArrowLeft size={18} color="black" />
                                    </button>
                                </Link>

                                <button type="button" className="btn btn-print" onClick={() => window.print()}>
                                    <i className="fa fa-print me-1" ></i>In
                                </button>
                                
                                {booking.status === "Đang xử lý" && (booking.method !== 'Tiền mặt' || (booking.method === 'Tiền mặt' && booking.isValidTime)) && !booking.reserved && (
                                    <button
                                        type="button"
                                        className="btn btn-reserved"
                                        disabled={isLoading.reserved}
                                        onClick={handleReserve}
                                    >
                                        {isLoading.reserved ? 
                                            <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                            : <><FaChair size={18} color="white"className="me-1" />Giữ chỗ</>
                                        }
                                    </button>
                                )}
                                
                                {booking.status === "Đang xử lý" && (booking.method !== 'Tiền mặt' || (booking.method === 'Tiền mặt' && booking.isValidTime)) && booking.checkoutStatus === "Chưa thanh toán" && (
                                    <button
                                        type="button"
                                        className="btn btn-money"
                                        disabled={isLoading.payment}
                                        onClick={handlePayment}
                                    >
                                        {isLoading.payment ? 
                                            <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                            : <><FaCreditCard size={18} color="white" className="me-1" />Đã thanh toán</>
                                        }
                                    </button>
                                )}
                                
                                {booking.status === "Đang xử lý" && (
                                    <button
                                        type="button"
                                        className="btn btn-cancel"
                                        disabled={isLoading.cancel}
                                        onClick={handleCancel}
                                    >
                                        {isLoading.cancel ? 
                                            <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                            : <><FaTimes color="white" className="me-1" size={18} />Hủy</>
                                        }                                        
                                    </button>
                                )}

                                {booking.status === "Đang xử lý" && booking.checkoutStatus === "Đã thanh toán" && (
                                    <button
                                        type="button"
                                        className="btn btn-confirm"
                                        disabled={isLoading.confirm}
                                        onClick={handleConfirm}
                                    >
                                        {isLoading.confirm ? 
                                            <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                            : <><FaCheck color="white" className="me-1" size={18} />Xác nhận</>
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(CalendarDetailPage);