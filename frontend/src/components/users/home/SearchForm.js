import { memo, useState } from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "./SearchForm.scss";
import { useNavigate } from "react-router-dom";
import { ErrorToast } from "@components/notifi";
import { ToastContainer } from "react-toastify";

const SearchForm = () => {
    const [searchForm, setSearchForm] = useState({
        destination: '',
        startDate: '',
        endDate: ''
    })
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const sd = searchForm.startDate ? searchForm.startDate.toLocaleDateString('sv-SE') : '';
        const ed = searchForm.endDate ? searchForm.endDate.toLocaleDateString('sv-SE') : '';
        const des = searchForm.destination ? searchForm.destination.trim() : '';

        if (searchForm.startDate || searchForm.endDate || searchForm.destination) {
            navigate(`/tour/search-destination?des=${encodeURIComponent(des)}&sd=${sd}&ed=${ed}`);
        } else {
            ErrorToast("Vui lòng chọn điểm đến hoặc ngày khởi hành hoặc ngày kết thúc.")
        }
    }

    return (
        <>
            <div className="search-form-custom container py-4 d-flex justify-content-center position-absolute z-2">
                <div className="bg-white rounded-4 shadow p-4 w-100 sub-form" data-aos="move-up-zoom-out" data-aos-duration="1500" data-aos-offset="50">
                    <div id="search_form">
                        <div className="row g-4">
                            <div className="col-12 col-md-6 col-lg-3 div-custom" >
                                <label className="form-label fw-semibold">
                                    <FaMapMarkerAlt className="me-1"/>Điểm đến
                                </label>

                                <select className="form-select" onChange={(e) => {setSearchForm((prev) => ({...prev, destination: e.target.value}))}}>
                                    <option value="">Chọn điểm đến</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                    <option value="Nha Trang">Nha Trang</option>
                                    <option value="Phú Quốc">Phú Quốc</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Sa Pa">Sa Pa</option>
                                    <option value="Hà Giang">Hà Giang</option>
                                    <option value="Quy Nhơn">Quy Nhơn</option>
                                    <option value="Đà Lạt">Đà Lạt</option>
                                    <option value="Cát Bà">Cát Bà</option>
                                    <option value="Hạ Long">Hạ Long</option>
                                    <option value="Huế">Huế</option>
                                    <option value="Côn Đảo">Côn Đảo</option>
                                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-6 col-lg-3 div-custom div-startdate">
                                <label className="form-label fw-semibold">
                                    <FaCalendarAlt className="me-1"/>Ngày khởi hành
                                </label>

                                <DatePicker
                                    selected={searchForm.startDate}
                                    onChange={(date) => setSearchForm((prev) => ({...prev, startDate: date}))}
                                    className="datetimepicker-custom"
                                    placeholderText="Chọn ngày đi"
                                    dateFormat="dd-MM-yyyy"
                                />
                            </div>

                            <div className="col-12 col-md-6 col-lg-3 div-custom">
                                <label className="form-label fw-semibold">
                                    <FaCalendarAlt className="me-1"/>Ngày kết thúc
                                </label>

                                <DatePicker
                                    selected={searchForm.endDate}
                                    onChange={(date) => setSearchForm((prev) => ({...prev, endDate: date}))}
                                    className="datetimepicker-custom"
                                    placeholderText="Chọn ngày về"
                                    dateFormat="dd-MM-yyyy"
                                />
                            </div>

                            <div className="col-12 col-md-6 col-lg-3 d-flex align-items-center justify-content-center">
                                <button type="button" className="btn w-100 rounded-pill fw-bold btn-custom" onClick={handleSubmit}>
                                    <FaSearch className="me-2" />Tìm kiếm
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

export default memo(SearchForm);
