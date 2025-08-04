import { useState, useEffect, memo, useCallback } from "react";
import "./detail.scss";
import { BookingApi, CheckoutApi } from "@services";
import formatCurrency from "@utils/formatCurrency.js";
import formatDatetime from "@utils/formatDatetime.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { noImage, momo, vnpay, cash } from "@assets";
import { FaArrowLeft, FaChair, FaCheck, FaCreditCard, FaTimes } from "react-icons/fa";
import { ErrorToast, SuccessToast } from "@components/notifi";
import { ToastContainer } from "react-toastify";

const CalendarDetailPage = () => {
    const [calendar, setCalendar] = useState([]);
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [totalCost, setTotalCost] = useState(0);

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
        setTotalCost(calendar.quantityAdult * calendar.adultPrice + calendar.quantityChildren * calendar.childrenPrice);
    }, [calendar.quantityAdult, calendar.adultPrice, calendar.quantityChildren, calendar.childrenPrice])

    const fetchCalendar = useCallback(async () => {
        try {
            const response = await BookingApi.getByIdAndAdmin(id);

            if (response?.code === 1807) {
                setCalendar(response?.result);
            } else {
                navigate("/manage/error/404");
            }
        }
        catch (error) {
            console.error("Failed to fetch calendar: ", error);
        }
        finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        setIsLoading(true);
        fetchCalendar();
    }, [id]);

    const sendMailInvoice = async (isConfirm) => {
        try {
            const response = await BookingApi.sendInvoiceToCustomer({
                to: calendar.email,
                subject: `Thông tin lịch đặt #${calendar.code}`,
                confirm: isConfirm,
                id: id
            });

            if (response?.code === 1401) {
                SuccessToast("Gửi mail thành công.");
            } else {
                ErrorToast("Gửi mail thất bại.");
            }
        } catch (error) {
            console.error("Failed to send mail invoice: ", error);
            ErrorToast("Gửi mail thất bại.");
        }
    }

    const handleCancel = async () => {
        const result = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn hủy lịch đặt <b>${calendar.code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
            try {
                const response = await BookingApi.cancelAdmin(id);

                if (response.code === 1803) {
                    SuccessToast("Lịch đặt đã được hủy thành công.")
                    setCalendar((prev) => ({
                        ...prev,
                        reserved: true,
                        status: "Đã hủy",
                    }));

                    sendMailInvoice(false);
                } else {
                    ErrorToast("Hủy lịch đặt không thành công.");
                }
            } catch (error) {
                console.error("Failed to cancel calendar: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            }
        }
    };

    const handleConfirm = async () => {
        const result = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn xác nhận lịch đặt <b>${calendar.code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
            try {
                const response = await BookingApi.confirm(id);

                if (response.code === 1804) {
                    SuccessToast("Lịch đặt đã được xác nhận thành công.");
                    setCalendar((prev) => ({
                        ...prev,
                        status: "Đã xác nhận",
                    }));

                    sendMailInvoice(true);
                } else {
                    ErrorToast("Xác nhận lịch đặt không thành công.")
                }
            } catch (error) {
                console.error("Failed to confirm calendar: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            }
        }
    };

    const handleCheckout = async () => {
        const result = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn xác nhận thanh toán lịch đặt <b>${calendar.code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
            try {
                const response = await CheckoutApi.confirm(calendar.checkoutId);

                if (response.code === 1908) {
                    SuccessToast("Lịch đặt đã được xác nhận thanh toán thành công.");
                    fetchCalendar();
                } else {
                    ErrorToast(response?.message || "Xác nhận thanh toán lịch đặt không thành công.")
                }
            } catch (error) {
                console.error("Failed to confirm calendar: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            }
        }
    };

    const handleReserve = async () => {
        const result = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn giữ chỗ lịch đặt <b>${calendar.code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (result.isConfirmed) {
            try {
                const response = await BookingApi.confirmReserve(id);

                if (response.code === 1805) {
                    SuccessToast("Lịch đặt đã được giữ chỗ thành công.");
                    setCalendar((prev) => ({
                        ...prev,
                        reserved: true,
                    }));
                } else {
                    ErrorToast(response?.message || "Giữ chỗ lịch đặt không thành công.")
                }
            } catch (error) {
                console.error("Failed to confirm calendar: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
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
            <div className="calendar-detail-page">
                <div className="row">
                    <div className="col-md-12">
                        <div className="x_panel">
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
                                                    {calendar.tourName} (
                                                    <small className="mx-1 start-date">{calendar.startDate ? formatDatetime(calendar.startDate) : ''}</small>-
                                                    <small className="mx-1 end-date">{calendar.endDate ? formatDatetime(calendar.endDate) : ''}</small>
                                                    )
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="row invoice-info mt-2">
                                            <div className="col-sm-4 invoice-col">
                                                <i>Khách hàng:</i>
                                                <address>
                                                    <strong>{calendar.fullName}</strong> <br />
                                                    Số điện thoại: {calendar.phone} <br />
                                                    Email: {calendar.email}
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
                                                    <b>Mã hóa đơn: {calendar.code}</b><br />
                                                    Thời gian đặt: {calendar.bookingTime ? formatDatetime(calendar.bookingTime) : ''}<br />
                                                    Trạng thái: <span className={statusClassMap[calendar.status] || ''}>{calendar.status}</span>
                                                </address>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="table mt-4">
                                                <table className="table table-striped">
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
                                                            <td> {calendar.quantityAdult} </td>
                                                            <td> {calendar.adultPrice ? formatCurrency(calendar.adultPrice) : 0} </td>
                                                            <td className="color-red"> {calendar.adultPrice ? formatCurrency(calendar.quantityAdult * calendar.adultPrice) : 0} </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Trẻ em</td>
                                                            <td> {calendar.quantityChildren} </td>
                                                            <td> {calendar.childrenPrice ? formatCurrency(calendar.childrenPrice) : 0} </td>
                                                            <td className="color-red"> {calendar.childrenPrice ? formatCurrency(calendar.quantityChildren * calendar.childrenPrice) : 0} </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <p className="lead fw-bold">Thông tin thanh toán:</p>
                                                {calendar.method !== "Tiền mặt" && (
                                                    <p><b>Mã giao dịch: {calendar.checkoutCode}</b></p>                                                   
                                                )}
                                                <p>
                                                    Phương thức:
                                                    <img src={methodClassMap[calendar.method] || noImage} className="ms-1 image no-print" alt={methodClassMap[calendar.method] || 'no-image'} />
                                                    <span className="ms-1">{calendar.method}</span>
                                                </p>
                                                <p>
                                                    Thời gian:
                                                    <span className="ms-1">{calendar.checkoutTime ? formatDatetime(calendar.checkoutTime) : ''}</span>
                                                </p>
                                                <p>
                                                    Trạng thái:
                                                    <span className={`ms-1 ${paymentClassMap[calendar.checkoutStatus] || ''}`}>{calendar.checkoutStatus}</span>
                                                </p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="lead fw-bold">Tính tiền:</p>
                                                <div className="table-responsive">
                                                    <table className="table">
                                                        <tbody>
                                                            <tr>
                                                                <th>Tổng tiền:</th>
                                                                <td>{formatCurrency(totalCost)}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Giảm giá:</th>
                                                                <td>{calendar.discount ? formatCurrency(calendar.discount) : 0}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Thành tiền:</th>
                                                                <td className="color-red fw-bold">{calendar.totalPrice ? formatCurrency(calendar.totalPrice) : 0}</td>
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
                                        <i className="fa fa-print"></i> In
                                    </button>
                                    
                                    {!calendar.reserved && (
                                        <button type="button" className="btn btn-reserved" onClick={handleReserve}>
                                            <FaChair size={18} color="white"className="me-1" />
                                            Giữ chỗ
                                        </button>
                                    )}
                                    
                                    {calendar.status === "Đang xử lý" && calendar.checkoutStatus === "Chưa thanh toán" && (
                                        <button type="button" className="btn btn-money" onClick={handleCheckout}>
                                            <FaCreditCard size={18} color="white" className="me-1" />
                                            Đã thanh toán
                                        </button>
                                    )}
                                    
                                    {calendar.status === "Đang xử lý" && calendar.checkoutStatus === "Đã thanh toán" && (
                                        <button type="button" className="btn btn-confirm" onClick={handleConfirm}>
                                            <FaCheck color="white" className="me-1" size={18} />
                                            Xác nhận
                                        </button>
                                    )}
                                    
                                    {calendar.status === "Đang xử lý" && (
                                        <button type="button" className="btn btn-cancel" onClick={handleCancel}>
                                            <FaTimes color="white" className="me-1" size={18} />
                                            Hủy
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </>
    );
};

export default memo(CalendarDetailPage);