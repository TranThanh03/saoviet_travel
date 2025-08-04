import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import './register.scss';
import { CustomerApi } from 'services';
import { SuccessToast } from 'components/notifi';
import { ToastContainer } from 'react-toastify';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        repeatpw: ''
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        let newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Họ và tên không được để trống!';
        
        if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại không được để trống!';
        
        if (!formData.email.trim()) newErrors.email = 'Email không được để trống!';
        
        if (!formData.password.trim()) newErrors.password = 'Mật khẩu không được để trống!';
        
        if (!formData.repeatpw.trim()) newErrors.repeatpw = 'Vui lòng nhập lại mật khẩu!';
        else if (formData.password !== formData.repeatpw) newErrors.repeatpw = 'Mật khẩu không khớp!';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await CustomerApi.create(formData);

            if (response?.code === 1300) {
                setFormData({
                    fullName: '',
                    phone: '',
                    email: '',
                    password: '',
                    repeatpw: ''
                });

                SuccessToast(<p>Vui lòng kiểm tra mail <b>{response.result.email}</b></p>);
            } else {
                let newErrors = {};
                if (response?.code === 1005 || response?.code === 1008) newErrors.phone = response.message;
                if (response?.code === 1006 || response?.code === 1009) newErrors.email = response.message;
                if (response?.code === 1007) newErrors.password = response.message;
                if (response?.code === 1010 || response?.code === 1011) newErrors.fullName = response.message;

                setErrors(newErrors);
            }
        } catch (error) {
            setErrors({ general: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại!' });
        }
    };

    return (
        <div className="register-page">
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="row border rounded-4 p-3 bg-white shadow my-2 bg-custom">
                    <h2 className="text-center fw-bold">Đăng ký</h2>

                    <form onSubmit={handleRegister}>
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="name">Họ và tên</label>
                            
                            {errors.fullName && <p className="text-danger mt-1">{errors.fullName}</p>}
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="phone">Số điện thoại</label>
                            
                            {errors.phone && <p className="text-danger mt-1">{errors.phone}</p>}
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="email">Email</label>
                            
                            {errors.email && <p className="text-danger mt-1">{errors.email}</p>}
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control"
                                id="pwd"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="pwd">Mật khẩu</label>
                            
                            {errors.password && <p className="text-danger mt-1">{errors.password}</p>}
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control"
                                id="repeatpw"
                                name="repeatpw"
                                value={formData.repeatpw}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="repeatpw">Nhập lại mật khẩu</label>
                            
                            {errors.repeatpw && <p className="text-danger mt-1">{errors.repeatpw}</p>}
                        </div>

                        {errors.general && <p className="text-danger mt-2">{errors.general}</p>}

                        <button type="submit" className="btn btn-lg btn-primary w-100 fs-6 mb-3">
                            Đăng ký
                        </button>
                    </form>

                    <p>
                        Bằng việc đăng ký tài khoản bạn đã đồng ý với
                        <Link to="#"> Điều khoản sử dụng </Link>của chúng tôi!
                    </p>
                    <p>
                        Bạn đã có tài khoản? <Link to="/auth/login">Đăng nhập</Link>
                        <Link to="/" id="back">Trang chủ</Link>
                    </p>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default memo(RegisterPage);