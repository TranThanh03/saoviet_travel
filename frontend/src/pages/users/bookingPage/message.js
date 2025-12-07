import { memo, useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./message.scss";
import { PaymentApi } from "services";
import { failedSvg, successSvg } from "assets";

const MessagePage = () => {
    const [status, setStatus] = useState();
    const [countdown, setCountdown] = useState(5);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPaymentCallback = async () => {
            try {
                const momoResultCode = queryParams.get("resultCode");
                const momoTransId = queryParams.get("transId");
                const vnpResponseCode = queryParams.get("vnp_ResponseCode");
                const vnpTransNo = queryParams.get("vnp_TransactionNo");

                if (momoResultCode && momoTransId) {
                    if (momoResultCode === "0") {
                        const response = await PaymentApi.validate(momoTransId);

                        if (response?.code === 2302) {
                            setStatus('success');
                        } else {
                            setStatus('failed');
                        }
                    } else {
                        setStatus('failed');
                    }   
                } else if (vnpResponseCode && vnpTransNo) {
                    if (vnpResponseCode === "00") {
                        const response = await PaymentApi.validate(vnpTransNo);

                        if (response?.code === 2302) {
                            setStatus('success');
                        } else {
                            setStatus('failed');
                        }
                    } else {
                        setStatus('failed');
                    }
                } else {
                    navigate("/error/404");
                }
            } catch (error) {
                console.error("Failed to fetch validate booking: ", error);
                setStatus('error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaymentCallback();
    }, []);

    useEffect(() => {
        if (status === "success") {
            const interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            const timeout = setTimeout(() => {
                navigate("/calendar/index");
            }, 5000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [status]);

    if (isLoading) {
        return (
            <div style={{height: 1000}}></div>
        );
    }

    return (
        <div className="checkout-message">
            <div className="message">
                {status === "success" ? (
                    <div className="success">
                        <img src={successSvg} alt="success"/>
                        <h2>Thanh toán thành công</h2>
                        <p>Cảm ơn bạn đã đặt tour tại Sao Việt</p>
                        <p>Chuyển hướng đến danh sách lịch đặt sau <span style={{color: 'red'}}>{countdown}</span> giây</p>
                    </div>
                ) : status === "failed" ? (
                    <div className="failed">
                        <img src={failedSvg} alt="failed"/>
                        <h2>Thanh toán không thành công</h2>
                        <p>Giao dịch chưa được hoàn tất. Vui lòng thử lại sau!</p>
                        <Link to="/">Về trang chủ</Link>
                    </div>
                ) : status === "error" ? (
                    <div className="error">
                        <img src={failedSvg} alt="error"/>
                        <h2>Đã xảy ra lỗi</h2>
                        <p>Hệ thống đang gặp sự cố hoặc kết nối không ổn định. Vui lòng thử lại sau!</p>
                        <Link to="/">Về trang chủ</Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default memo(MessagePage);