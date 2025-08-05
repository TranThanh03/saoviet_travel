import { memo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './index.scss';
import formatCurrency from 'utils/formatCurrency.js';
import { ScheduleApi, CustomerApi, CheckoutApi, PromotionApi } from 'services';
import formatDatetime from 'utils/formatDatetime.js';
import Swal from 'sweetalert2';
import { cash, momo, vnpay, voucherImg } from 'assets';
import { ErrorToast } from 'components/notifi';
import { ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';

const BookingPage = () => {
    const [user, setUser] = useState({
        fullName: '',
        phone: '',
        email: ''
    });
    const [schedule, setSchedule] = useState({
        tourCode: '',
        tourName: '',
        startDate: '',
        endDate: '',
        quantityDay: 0,
        people: 0,
        adultPrice: 0,
        childrenPrice: 0
    });
    const [promotion, setPromotion] = useState({
        id: '',
        discount: 0
    });
    const [formData, setFormData] = useState({
        scheduleId: '',
        promotionId: '',
        quantityAdult: 0,
        quantityChildren: 0,
        method: ''
    });
    const paymentOptions = [
        { value: 'momo', label: 'Thanh toán bằng MoMo', img: momo},
        { value: 'vnpay', label: 'Thanh toán bằng VNPay', img: vnpay},
        { value: 'cash', label: 'Thanh toán tại văn phòng', img: cash},
    ];

    const { id } = useParams();
    const [quantityAdult, setQuantityAdult] = useState(0);
    const [quantityChildren, setQuantityChildren] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [method, setMethod] = useState('');
    const [agree, setAgree] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [isShow, setIsShow] = useState(true);
    const [vouchers, setVouchers] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resUser = await CustomerApi.infor();
                const resSchedule = await ScheduleApi.getScheduleTourById(id);

                if (resUser?.code === 1303) {
                    setUser(resUser?.result);
                }

                if (resSchedule?.code === 1604) {
                    if (resSchedule?.result) {
                        setSchedule(resSchedule.result);
                    } else {
                        navigate("/error/404");    
                    }
                }
                else if (resSchedule?.code === 1028) {
                    navigate("/error/404");
                }
            }
            catch(error) {
                console.error("Failed to fetch data: " + error);
                navigate("/error/404");
            }
        };

        fetchData();
    }, [id])

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await PromotionApi.getList();

                if (response?.code === 1702) {
                    setVouchers(response?.result);
                }
            } catch (error) {
                console.error("Failed to fetch promotions: ", error);
            }
        }

        fetchPromotions();
    }, []);

    useEffect(() => {
        if (schedule.startDate) {
            const currentDate = dayjs();
            const startDate = dayjs(schedule.startDate);

            if (currentDate.isBefore(startDate.subtract(2, 'day'))) {
                setIsHidden(false);
            } else {
                setIsHidden(true);
            }
        }
    }, [schedule?.startDate]);

    useEffect(() => {
        if (formData.method === 'cash') {
            setPromotion({
                id: '',
                discount: 0
            });
            setInputValue('');
            setIsShow(false);
        } else {
            setIsShow(true);
        }
    }, [formData.method]);

    useEffect(() => {
        setTotalCost(quantityAdult * schedule.adultPrice + quantityChildren * schedule.childrenPrice - promotion.discount);
    }, [quantityAdult, quantityChildren, promotion.discount]);

    useEffect(() => {
        setFormData({
            scheduleId: id,
            promotionId: promotion.id,
            quantityAdult: quantityAdult,
            quantityChildren: quantityChildren,
            method: method
        });
    }, [id, promotion.id, quantityAdult, quantityChildren, method]);

    const handleIncreaseAdult = () => {
        if (quantityAdult + quantityChildren <= schedule.people - 1) {
            setQuantityAdult(prev => Math.min(prev + 1, 99));
        } else {
            ErrorToast("Số lượng hành khách vượt quá số lượng tối đa.");
        }
    };

    const handleDecreaseAdult = () => {
        setQuantityAdult(prev => Math.max(prev - 1, 0));
    };

    const handleIncreaseChildren = () => {
        if (quantityAdult + quantityChildren <= schedule.people - 1) {
            setQuantityChildren(prev => Math.min(prev + 1, 99));
        } else {
            ErrorToast("Số lượng hành khách vượt quá số lượng tối đa.");
        }
    };

    const handleDecreaseChildren = () => {
        setQuantityChildren(prev => Math.max(prev - 1, 0));
    };
    
    const handleVoucherClick = (voucher) => {
        setPromotion({
            id: voucher.id,
            discount: voucher.discount
        })
        setInputValue(voucher.code);
        setIsActive(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (agree && formData.method) {
            try {
                const response = await CheckoutApi.process(formData);

                if (response?.code === 1901 || response?.code === 1902) {
                    window.location.href = response?.result?.checkoutUrl;
                } else if (response?.code === 1903) {
                    Swal.fire({
                        title: 'Thành công',
                        html: `<p style="color: green; margin-bottom: 5px;">Đặt tour thành công</p>
                            <p style="color: red;">${response.result.checkoutUrl}</p>`,
                        icon: 'success',
                        confirmButtonText: 'Đóng'
                    }).then(() => {
                        navigate("/calendar/index");
                    });
                } else {
                    ErrorToast(response?.message);
                }
            } catch (error) {
                ErrorToast("Đã xảy ra lỗi không xác định. Vui lòng thử lại!")
            }
        }
    }

    return (
        <section className="booking-form-custom container mb-100">
            <div className="booking-container row">
                <div className="booking-info col-lg-6">
                    <h2 className="booking-header">Thông tin khách hàng</h2>
                    <div className="booking__infor">
                        <div className="form-group">
                            <label htmlFor="username">Họ và tên</label>
                            <input type="text" id="username" value={user.fullName} disabled />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tel">Số điện thoại</label>
                            <input type="text" id="tel" value={user.phone} disabled />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="text" id="email" value={user.email} disabled />
                        </div>
                    </div>

                    <h2 className="booking-header mt-40">Hành khách</h2>
                    <div className="booking__quantity">
                        <div className="form-group quantity-selector">
                            <label>Người lớn</label>
                            <div className="input__quanlity">
                                <button type="button" className="quantity-btn" onClick={handleDecreaseAdult}>-</button>
                                <input type="number" className="quantity-input" value={quantityAdult} min="0" readOnly />
                                <button type="button" className="quantity-btn" onClick={handleIncreaseAdult}>+</button>
                            </div>
                        </div>

                        <div className="form-group quantity-selector">
                            <label>Trẻ em</label>
                            <div className="input__quanlity">
                                <button type="button" className="quantity-btn" onClick={handleDecreaseChildren}>-</button>
                                <input type="number" className="quantity-input" value={quantityChildren} min="0" readOnly />
                                <button type="button" className="quantity-btn" onClick={handleIncreaseChildren}>+</button>
                            </div>
                        </div>
                    </div>

                    <div className="privacy-section">
                        <p>Bằng cách nhấp chuột vào nút <b>"ĐỒNG Ý"</b> dưới đây, khách hàng đồng ý rằng các điều kiện điều khoản
                        này sẽ được áp dụng. Vui lòng đọc kỹ điều kiện điều khoản trước khi lựa chọn sử dụng dịch vụ của
                        Sao Việt.</p>
                        <div className="privacy-checkbox">
                            <input type="checkbox" id="agree" onClick={() => setAgree(!agree)} />
                            <span>Tôi đã đọc và đồng ý với <a href="#" target="_blank">Điều khoản thanh toán.</a></span>
                        </div>
                    </div>

                    <h2 className="booking-header mt-40">Phương thức thanh toán</h2>
                    {paymentOptions.map((option) => (
                        <label key={option.value} className={`payment-option ${option.value === 'cash' && isHidden ? 'hidden' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value={option.value}
                                required
                                onChange={(e) => setMethod(e.target.value)}
                                checked={method === option.value}
                            />
                            <img src={option.img} alt={option.value} style={option.value === 'momo' ? { width: '35px' } : {}} />
                            {option.label}
                        </label>
                    ))}
                </div>

                <div className="booking-summary col-lg-5">
                    <div className="summary-section">
                        <div className="tour-infor">
                            <p>Mã Tour: <span>{schedule.tourCode}</span></p>
                            <h5 className="widget-title fw-bold">{schedule.tourName}</h5>
                            <p>Ngày khởi hành: <span>{schedule.startDate ? formatDatetime(schedule.startDate) : ''}</span></p>
                            <p>Ngày kết thúc: <span>{schedule.endDate ? formatDatetime(schedule.endDate) : ''}</span></p>
                            <p>Thời gian: <span>{schedule.quantityDay ? `${schedule.quantityDay} ngày ${schedule.quantityDay-1} đêm` : ''}</span></p>
                            <p>Còn nhận: <span>{schedule.people} <i className="far fa-user"></i></span></p>
                        </div>

                        <div className="order-summary">
                            <div className="summary-item">
                                <span>Người lớn:</span>
                                <div>
                                    <span className="quantity__adults">{quantityAdult}</span>
                                    <span className="mx-1">x</span>
                                    <span className="total-price">{schedule.adultPrice ? formatCurrency(schedule.adultPrice) : 0}</span>
                                </div>
                            </div>
                            <div className="summary-item">
                                <span>Trẻ em:</span>
                                <div>
                                    <span className="quantity__children">{quantityChildren}</span>
                                    <span className="mx-1">x</span>
                                    <span className="total-price">{schedule.childrenPrice ? formatCurrency(schedule.childrenPrice): 0}</span>
                                </div>
                            </div>
                            <div className="summary-item">
                                <span>Giảm giá:</span>
                                <div>
                                    <span className="total-price">{formatCurrency(promotion.discount)}</span>
                                </div>
                            </div>
                            <div className="summary-item">
                                <span className="fw-bold">Tổng cộng:</span>
                                <span id="total-cost">{formatCurrency(totalCost)}</span>
                            </div>
                        </div>

                        {isShow && (
                            <div className="order-coupon">
                                <span className={`${formData.quantityAdult + formData.quantityChildren > 0 ? '' : 'inactive'}`} id="title" onClick={() => setIsActive(!isActive)}>Khuyến mãi</span>          
                                <input type="text" placeholder="Mã giảm giá" className="input-coupon" value={inputValue} disabled/>

                                {isActive && (
                                    <div className="voucher-dropdown">
                                        {vouchers.length > 0 ? (vouchers.map((voucher) => (
                                            <div key={voucher.id} className="voucher-item" onClick={() => handleVoucherClick(voucher)}>
                                                <img src={voucherImg} alt="Voucher" className="voucher-image" />
                                                <div className="voucher-info">
                                                    <p className="voucher-code">Mã: {voucher.code}</p>
                                                    <p className="voucher-title">{voucher.title}</p>
                                                    <p className="voucher-desc">{voucher.description}</p>
                                                    <p className="voucher-expiry">
                                                        <i className="fa-regular fa-clock me-1"></i>{voucher.endDate ? formatDatetime(voucher.endDate) : ''}
                                                        <span id="voucher-qty"><i className="fal fa-ticket me-1"></i>{voucher.quantity}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))) : (
                                            <div className="voucher-item">
                                                Không có.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <button type="button" className={`booking-btn btn-submit-booking ${agree && formData.method && formData.quantityAdult + formData.quantityChildren > 0 ? '' : 'inactive'}`} onClick={handleSubmit}>Xác nhận</button>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </section>
    );
};

export default memo(BookingPage);