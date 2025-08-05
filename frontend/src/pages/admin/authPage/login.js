import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.scss';
import { logo } from 'assets';
import { AuthApi } from 'services';

const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrorMessage('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password) {
            setErrorMessage('Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
            return;
        }

        try {
            const response = await AuthApi.loginAdmin(formData);

            if (response?.code === 9996) {
                navigate('/manage/dashboard');
            } 
            else if (response?.code === 1009) {
                setErrorMessage("Tài khoản không tồn tại!");
            }
            else {
                setErrorMessage(response.message);
            }
        } catch (error) {
            setErrorMessage('Đã xảy ra lỗi không xác định. Vui lòng thử lại!');
        }
    };

    return (
        <div className='login-manage-page'>
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="row border rounded-5 p-3 bg-while shadow box-area">
                    <div className="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box">
                        <div className="featured-image my-3">
                            <img src={logo} className="img-fluid" alt="Logo" />
                        </div>
                        <p className="text-white fs-2 mb-0">Sao Việt</p>
                        <small className="text-white text-wrap text-center fs-4 mb-2">Uy tín tạo nên sự tin tưởng</small>
                    </div>

                    <div className="col-md-6 right-box d-flex px-4">
                        <div className="row align-items-center">
                            <div className="header-text mb-2">
                                <h2 className="fw-bold">Xin chào</h2>
                                <p>Chào mừng bạn đến với trang dành cho quản trị viên</p>
                            </div>

                            <form onSubmit={handleLogin}>
                                <div className="input-group mb-3">
                                    <p><b>Tài khoản</b></p>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg bg-light fs-6"
                                        placeholder="SDT hoặc Email"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="input-group mb-1">
                                    <p><b>Mật khẩu</b></p>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg bg-light fs-6"
                                        placeholder="******"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="text-danger mt-2">
                                    {errorMessage}
                                </div>

                                <div className="mt-3">
                                    <button type="submit" className="btn btn-lg btn-primary w-100 fs-6">
                                        Đăng nhập
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(LoginPage);