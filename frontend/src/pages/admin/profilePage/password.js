import { memo, useState } from 'react';
import './password.scss';
import { userPassword } from 'assets';
import { AdminApi } from 'services';
import { SuccessToast } from 'components/notifi';
import { ToastContainer } from 'react-toastify';

const PasswordPage = () => {
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ 
        currentPassword: '', 
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value.trim() }));
        setError(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError('Vui lòng không bỏ trống!');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu mới không khớp!');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError('Mật khẩu mới phải khác mật khẩu hiện tại!');
            return;
        }

        try {
            const response = await AdminApi.changePassword(formData);

            if (response?.code === 1202) {
                setFormData((prev) =>
                    Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: '' }), {})
                );

                SuccessToast("Thay đổi mật khẩu thành công.");
            } 
            else if (response?.code === 1015) {
                setError("Mật khẩu hiện tại không chính xác!");
            }
            else {
                setError(response?.message);
            }
        } catch (error) {
            setError("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
        }
    };

    return (
        <>
            <div className="manage-password container">
                <div className="card mx-auto shadow" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                    <div className="card shadow-sm p-4">
                        <div className="d-flex justify-content-center mb-4">
                            <img src={userPassword} alt="avatar" className="avatar rounded-circle" />
                        </div>
                        <div className="text-center">
                            <h2 className="fs-4 mb-4">Thay đổi mật khẩu</h2>
                            <div className="d-flex flex-column gap-3">
                                <div className="text-start">
                                    <label htmlFor="currentPassword" className="form-label fw-bold text-muted">Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        className="form-custom custom-input"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="text-start">
                                    <label htmlFor="newPassword" className="form-label fw-bold text-muted">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        className="form-custom custom-input"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="text-start">
                                    <label htmlFor="confirmPassword" className="form-label fw-bold text-muted">Nhập lại mật khẩu</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className="form-custom custom-input"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                {error && <p className="text-danger text-start">{error}</p>}
                                <button
                                    className="btn custom-btn text-white w-100"
                                    onClick={handleUpdate}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </>
    );
};

export default memo(PasswordPage);
