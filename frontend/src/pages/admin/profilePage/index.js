import { memo, useEffect, useState } from 'react';
import './index.scss';
import { useNavigate } from 'react-router-dom';
import { userAvatar } from 'assets';
import { AdminApi } from 'services';
import { SuccessToast } from 'components/notifi';
import { ToastContainer } from 'react-toastify';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ fullName: '', phone: '', email: '' });

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
                const response = await AdminApi.infor();
                if (response?.code === 1200) {
                    setUser(response.result);
                }
            }
            catch (error) {
                console.error("Failed to fetch admin: ", error);
                navigate("/manage/error/404");
            }
        };

        fetchData();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value.trim() }));
        setError(null);
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
            setError('Vui lòng không bỏ trống!');
            return;
        }

        if (!isDataChanged()) {
            setError('Dữ liệu không thay đổi, không thể cập nhật!');
            return;
        }

        try {
            const response = await AdminApi.update(formData);

            if (response.code === 1201) {
                setUser((prev) => ({ ...prev, ...formData }));
                SuccessToast("Cập nhật thông tin thành công.");
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError('Đã xảy ra lỗi không xác định. Vui lòng thử lại!');
        }
    };

    return (
        <>
            <div className="manage-profile container">
                <div className="card mx-auto shadow" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                    <div className="card-body text-center">
                        <div className="d-flex justify-content-center mb-4">
                            <img src={userAvatar} alt="avatar" className="avatar rounded-circle" />
                        </div>
                        <div className="user-details">
                            <h2 className="card-title mb-4">Thông tin quản trị viên</h2>
                            <table className="table table-borderless">
                                <tbody>
                                    <tr>
                                        <td><strong>Mã quản trị:</strong></td>
                                        <td className="text-end me-1">{user?.code || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Họ tên:</strong></td>
                                        <td className="text-end">
                                            <input
                                                type="text"
                                                name="fullName"
                                                className="form-custom"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Số điện thoại:</strong></td>
                                        <td className="text-end">
                                            <input
                                                type="text"
                                                name="phone"
                                                className="form-custom"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Email:</strong></td>
                                        <td className="text-end">
                                            <input
                                                type="text"
                                                name="email"
                                                className="form-custom"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    {error && (
                                        <tr>
                                            <td colSpan="2">
                                                <div className="text-danger text-center">{error}</div>
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td colSpan="2" className="text-center float-none">
                                            <button
                                                type="button"
                                                className="btn text-white"
                                                onClick={handleUpdate}
                                            >
                                                Cập nhật
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </>
    );
};

export default memo(ProfilePage);
