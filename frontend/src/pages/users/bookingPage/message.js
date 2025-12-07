import { memo, useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./message.scss";
import { CheckoutApi } from "services";
import { failedSvg, successSvg } from "assets";
import { ErrorToast } from "components/notifi";

const MessagePage = () => {
    const [status, setStatus] = useState();
    const [countdown, setCountdown] = useState(5);
    const [scheduleId, setScheduleId] = useState('');
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);

    const processScheduleIdByMomo = () => {
        const extraData = queryParams.get("extraData");

        if (extraData) {
            const decodedData = decodeURIComponent(extraData);
            const scheduleMatch = decodedData.match(/scheduleId=([^;]*)/);
            setScheduleId(scheduleMatch ? scheduleMatch[1] : "");
        }
    }

    const processScheduleIdByVnpay = () => {
        const orderInfo = queryParams.get("vnp_OrderInfo");

        if (orderInfo) {
            const decodedData = decodeURIComponent(orderInfo);
            const scheduleMatch = decodedData.match(/scheduleId=([^;]*)/);
            setScheduleId(scheduleMatch ? scheduleMatch[1] : "");
        }
    }

    useEffect(() => {
        const fetchCheckoutCallback = async () => {
            try {
                const resultMomoCode = queryParams.get("resultCode");
                const resultVnpCode = queryParams.get("vnp_ResponseCode");

                if (resultMomoCode) {
                    processScheduleIdByMomo();

                    if (resultMomoCode === "0" ) {
                        const response = await CheckoutApi.momoCallback(queryParams);

                        if (response?.code === 1904) {
                            setStatus('success');
                        } else if (response?.code === 1905) {
                            setStatus('failed');
                        } else if (response?.code === 1044) {
                            setStatus('failed');
                            ErrorToast("Lỗi không xác định. Vui lòng liên hệ hỗ trợ viên để được hỗ trợ!");
                        } else {
                            navigate("/error/404");
                        }
                    } else {
                        setStatus('failed');
                    }
                }
                
                if (resultVnpCode) {
                    processScheduleIdByVnpay();

                    if (resultVnpCode === "00") {
                        const response = await CheckoutApi.vnpayCallback(queryParams);

                        if (response?.code === 1906) {
                            setStatus('success');
                        } else if (response?.code === 1907) {
                            setStatus('failed');
                        } else if (response?.code === 1044) {
                            setStatus('failed');
                            ErrorToast(response?.message);
                        } else {
                            navigate("/error/404");
                        }
                    } else {
                        setStatus('failed');
                    }
                }
            }
            catch (error) {
                console.error("Failed to fetch checkout callback: ", error);

                if (error.status !== 500) {
                    navigate("/error/404");
                }
            }
            finally {
                setLoading(false);
            }
        };

        fetchCheckoutCallback();
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
                        <h2>Thanh toán thất bại</h2>
                        <p>Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại!</p>
                        <Link to={`/booking/${scheduleId}`}>Đặt tour</Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default memo(MessagePage);