import { memo, useState } from 'react';
import './password.scss';
import { userPassword } from 'assets';
import { CustomerApi } from 'services';
import { ErrorToast, SuccessToast } from 'components/notifi';
import PasswordInput from 'components/passwordInput';

const PasswordPage = () => {
    const [msgError, setMsgError] = useState("");
    const [formData, setFormData] = useState({ 
        currentPassword: '', 
        newPassword: '',
        repeatPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value.trim() }));
        setMsgError("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.currentPassword || !formData.newPassword || !formData.repeatPassword) {
            setMsgError('Vui lòng không bỏ trống.');
            return;
        }

        if (formData.newPassword !== formData.repeatPassword) {
            setMsgError('Nhập lại mật khẩu không khớp.');
            return;
        }

        if (formData.newPassword.length < 8) {
            setMsgError('Mật khẩu có độ dài từ 8 ký tự trở lên.');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setMsgError('Mật khẩu mới phải khác mật khẩu hiện tại.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await CustomerApi.changePassword(formData);

            if (response?.code === 1306) {
                setFormData({
                    currentPassword: '', 
                    newPassword: '',
                    repeatPassword: ''
                });

                SuccessToast("Thay đổi mật khẩu thành công.");
            } 
            else if (response?.code === 1015) {
                setMsgError("Mật khẩu hiện tại không chính xác!");
            }
            else {
                setMsgError(response?.message);
            }
        } catch (error) {
            console.error("Failed to change password: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="user-password container">
            <div className="card mx-auto shadow" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                <div className="card shadow-sm p-4">
                    <div className="text-center mb-4">
                        <img src={userPassword} alt="avatar" className="avatar rounded-circle" />
                    </div>
                    <div className="text-center">
                        <h2 className="fs-4 mb-4">Thay đổi mật khẩu</h2>
                        <div className="d-flex flex-column">
                            <div className="text-start">
                                <label className="fw-bold text-muted">Mật khẩu hiện tại</label>
                                <PasswordInput
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    name="currentPassword"
                                    id="password"
                                />
                            </div>
                            <div className="text-start">
                                <label className="fw-bold text-muted mt-3">Mật khẩu mới</label>
                                <PasswordInput
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    name="newPassword"
                                    id="password"
                                />
                            </div>
                            <div className="text-start">
                                <label className="fw-bold text-muted mt-3">Nhập lại mật khẩu</label>
                                <PasswordInput
                                    value={formData.repeatPassword}
                                    onChange={handleInputChange}
                                    name="repeatPassword"
                                    id="password"
                                />
                            </div>
                            {msgError && <span className="color-red text-start mt-1">{msgError}</span>}
                            <button
                                className="btn custom-btn text-white w-100 mt-4"
                                disabled={isLoading}
                                onClick={handleUpdate}
                            >
                                {isLoading ? 
                                    <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                    : 'Xác nhận'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(PasswordPage);
