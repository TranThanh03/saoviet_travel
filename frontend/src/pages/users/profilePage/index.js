import { memo, useEffect, useState } from 'react';
import './index.scss';
import { useNavigate } from 'react-router-dom';
import { userAvatar } from 'assets';
import { CustomerApi } from 'services';
import { SuccessToast } from 'components/notifi';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [msgError, setMsgError] = useState(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ fullName: '', phone: '', email: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                email: user.email || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await CustomerApi.info();
                if (response?.code === 1303) {
                    setUser(response.result);
                }
            }
            catch (error) {
                console.error("Failed to fetch user data:", error);
                navigate("/error/404");
            }
        };

        fetchData();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value.trim() }));
        setMsgError(null);
    };

    const isDataChanged = () => {
        return (
            user &&
            (formData.fullName !== user.fullName ||
            formData.phone !== user.phone ||
            formData.email !== user.email)
        );
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.email) {
            setMsgError('Vui lòng không bỏ trống!');
            return;
        }

        if (!isDataChanged()) {
            setMsgError('Dữ liệu không thay đổi, không thể cập nhật!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await CustomerApi.update(formData);

            if (response.code === 1304) {
                setUser((prev) => ({ ...prev, ...formData }));
                SuccessToast("Cập nhật thông tin thành công.");
            } else {
                setMsgError(response.message);
            }
        } catch (error) {
            setMsgError('Đã xảy ra lỗi không xác định. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="user-profile container">
            <div className="card mx-auto shadow p-4" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                <div className="card-body text-center">
                    <div className="mb-4">
                        <img src={userAvatar} alt="avatar" className="avatar rounded-circle" />
                    </div>
                    <div className="user-details">
                        <h2 className="card-title">Thông tin khách hàng</h2>
                        <div className="text-start">
                            <label className="fw-bold text-muted mt-3">Mã khách hàng:</label>
                            <input
                                type="text"
                                name="code"
                                className="form-control form-custom"
                                style={{ borderColor: '#dee2e6' }}
                                disabled
                                value={user?.code || 'N/A'}
                            />
                        </div>
                        <div className="text-start">
                            <label className="fw-bold text-muted mt-3">Họ tên:</label>
                            <input
                                type="text"
                                name="fullName"
                                className="form-custom"
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="text-start">
                            <label className="fw-bold text-muted mt-3">Số điện thoại:</label>
                            <input
                                type="text"
                                name="phone"
                                className="form-custom"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="text-start">
                            <label className="fw-bold text-muted mt-3">Email:</label>
                            <input
                                type="text"
                                name="email"
                                className="form-custom"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        {msgError && <span className="color-red text-start mt-1" style={{ display: 'block' }}>{msgError}</span>}
                        <button
                            type="button"
                            className="btn text-white w-100 mt-4"
                            disabled={isLoading}
                            onClick={handleUpdate}
                        >
                            {isLoading ? 
                                <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                : 'Cập nhật'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ProfilePage);
