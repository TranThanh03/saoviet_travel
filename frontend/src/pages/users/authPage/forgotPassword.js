import { memo, useRef, useState } from "react";
import "./forgotPassword.scss";
import { useNavigate } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { logo } from "assets";
import { ErrorToast, SuccessToast } from "components/notifi";
import { AuthApi } from "services";
import PasswordInput from "components/passwordInput";

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatNewPassword, setRepeatNewPassword] = useState("");
    const [msgError, setMsgError] = useState("");
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(60);
    const timerRef = useRef(null);
    const [isLoading, setIsLoading] = useState({
        send: false,
        resend: false,
        verify: false,
        reset: false
    });

    const startCountDown = () => {
        setTimeLeft(60);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setMsgError("Vui lòng nhập email.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMsgError("Vui lòng nhập email đúng định dạng 'example@example.com'.");
            return;
        }

        setIsLoading(prev => ({ ...prev, send: true }));

        try {
            const response = await AuthApi.forgotPassword({'email': email});

            if (response?.code === 1904) {
                SuccessToast(`Gửi mã OTP qua email ${email} thành công.`);
                setStep(2);

                if (timerRef.current !== null) {
                    clearInterval(timerRef.current);
                }
                startCountDown();
            } else if (response?.code === 1013) {
                ErrorToast("Tài khoản không tồn tại hoặc không hoạt động.");
            } else {
                ErrorToast(response?.message || `Gửi mã OTP qua email ${email} không thành công.`);
            }
        } catch(error) {
            console.error("Failed to forgot password: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
        } finally {
            setIsLoading(prev => ({ ...prev, send: false }));
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        
        if (!otp) {
            setMsgError("Vui lòng nhập mã OTP.");
            return;
        }

        const otpRegex = /^[0-9]{6}$/;
        if (!otpRegex.test(otp)) {
            setMsgError("Mã OTP phải gồm 6 số [0-9].");
            return;
        }

        setIsLoading(prev => ({ ...prev, verify: true }));

        try {
            const response = await AuthApi.verifyOTP({'email': email, 'otp': otp})

            if (response?.code === 1906) {
                setResetToken(response?.result);
                setOtp("");
                setStep(3);
            } else if (response?.code === 1013) {
                ErrorToast("Tài khoản không tồn tại hoặc không hoạt động.");
            } else {
                ErrorToast(response?.message || `Xác thực mã OTP không thành công.`);
            }
        } catch(error) {
            console.error("Failed to verify OTP: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
        } finally {
            setIsLoading(prev => ({ ...prev, verify: false }));
        }
    };

    const handleResendOtp = async (e) => {
        e.preventDefault();
        
        if (timeLeft > 0) {
            return;
        }

        setIsLoading(prev => ({ ...prev, resend: true }));

        try {
            const response = await AuthApi.resendOTP({'email': email});

            if (response?.code === 1905) {
                SuccessToast(`Gửi lại mã OTP qua email ${email} thành công.`);
                startCountDown();
            } else if (response?.code === 1013) {
                ErrorToast("Tài khoản không tồn tại hoặc không hoạt động.");
            } else {
                ErrorToast(response?.message || `Gửi lại mã OTP qua email ${email} không thành công.`);
            }
        } catch(error) {
            console.error("Failed to resend OTP: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
        } finally {
            setIsLoading(prev => ({ ...prev, resend: false }));
        }
    };

    const handleNewPasswordSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword || !repeatNewPassword) {
            setMsgError("Vui lòng không bỏ trống.");
            return;
        }

        if (newPassword.length < 8) {
            setMsgError("Mật khẩu có độ dài tối thiểu 8 ký tự.");
            return;
        }

        if (newPassword !== repeatNewPassword) {
            setMsgError("Nhập lại mật khẩu không khớp.");
            return;
        }

        setIsLoading(prev => ({ ...prev, reset: true }));

        try {
            const response = await AuthApi.resetPassword({'email': email, 'resetToken': resetToken, 'newPassword': newPassword});

            if (response?.code === 1907) {
                SuccessToast("Thay đổi mật khẩu thành công.");
                navigate("/auth/login");
            } else if (response?.code === 1013) {
                ErrorToast("Tài khoản không tồn tại hoặc không hoạt động.");
            } else if (response?.code === 1081) {
                ErrorToast("Đã hết thời gian thay đổi mật khẩu.");
                setResetToken("");
                setNewPassword("");
                setRepeatNewPassword("");
                setStep(1);
            } else {
                ErrorToast(response?.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
            }
        } catch(error) {
            console.error("Failed to reset password: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
        } finally {
            setIsLoading(prev => ({ ...prev, reset: false }));
        }
    };

    return (
        <div className="container forgot-container d-flex justify-content-center align-items-center">
            <div className="card forgot-card p-4 shadow-lg">
                <div className="mb-2">
                    <span
                        className="back-btn"
                        onClick={() => {
                            if (step === 1) {
                                navigate("/auth/login");
                            } else {
                                setStep(step - 1);
                            }
                        }}
                    >
                        <BsChevronLeft size={22} />
                    </span>
                    <img src={logo} className="logo" alt="Logo" />
                </div>

                <h4 className="text-center fw-bold mb-4">Quên mật khẩu</h4>

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="animate-fade">
                        <label>Nhập địa chỉ email của bạn</label>
                        <input
                            type="text"
                            className="form-control mb-1"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                setMsgError("")
                                setEmail(e.target.value.trim())
                            }}
                        />
                        <span className="msg-error mb-3">{msgError}</span>
                        <button className="btn btn-primary w-100" type="submit" disabled={isLoading.send}>
                            {isLoading.send ? 
                                <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                : 'Tiếp tục'
                            }
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleOtpSubmit} className="animate-fade">
                        <label style={{ wordBreak: 'break-all' }}>Nhập mã OTP(6 số) đã gửi tới '{email}'</label>
                        <input
                            type="text"
                            className="form-control mb-1"
                            placeholder="Mã OTP"
                            value={otp}
                            onChange={(e) => {
                                setMsgError("")
                                setOtp(e.target.value.trim())
                            }}
                        />
                        <span className="msg-error mb-1">{msgError}</span>
                        {timerRef.current !== null && (
                            <span className={`resend-otp ${(timeLeft > 0 || isLoading.resend) && 'disable'}`} onClick={handleResendOtp}>
                                {isLoading.resend && <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>}
                                Gửi lại mã OTP{timeLeft > 0 ? ` (sau ${timeLeft}s)` : ''}.
                            </span>
                        )}
                        <button className="btn btn-primary w-100 mt-3" type="submit" disabled={isLoading.verify}>
                            {isLoading.verify ? 
                                <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                : 'Tiếp tục'
                            }
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleNewPasswordSubmit} className="animate-fade">
                        <span>Vui lòng thay đổi mật khẩu trong vòng 10 phút.</span>
                        <label className="mt-1">Mật khẩu mới</label>
                        <PasswordInput
                            value={newPassword}
                            onChange={(e) => {
                                setMsgError("")
                                setNewPassword(e.target.value.trim())
                            }}
                            name="newPassword"
                            id="password"
                        />
                        <label className="mt-3">Nhập lại mật khẩu</label>
                        <PasswordInput
                            value={repeatNewPassword}
                            onChange={(e) => {
                                setMsgError("")
                                setRepeatNewPassword(e.target.value.trim())
                            }}
                            name="repeatNewPassword"
                            id="password"
                        />
                        <span className="msg-error mt-1">{msgError}</span>
                        <button className="btn btn-success w-100 mt-4" type="submit" disabled={isLoading.reset}>
                            {isLoading.reset ? 
                                <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                : 'Xác nhận'
                            }
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default memo(ForgotPasswordPage)