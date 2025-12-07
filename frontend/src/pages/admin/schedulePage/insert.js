import { useEffect, useState } from "react";
import { ScheduleApi } from "services";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./insert.scss";
import DatePicker from "react-datepicker";
import { ErrorToast, SuccessToast } from "components/notifi";
import TourSelector from "components/admin/select";
import getTodayUTC7 from "utils/getTodayUTC7";

const ScheduleInsertPage = () => {
    const [formData, setFormData] = useState({
        tourId: null,
        startDate: getTodayUTC7().toISOString().split('T')[0],
        totalPeople: null,
        adultPrice: null,
        childrenPrice: null
    });
    const [disabledDates, setDisabledDates] = useState([]);
    const [dataDate, setDataDate] = useState({
        quantityDay: null,
        endDate: null
    })
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (date, name) => {
        const formattedDate = date ? date.toISOString().split('T')[0] : null;
        setFormData(prev => ({ ...prev, [name]: formattedDate }));
    };

    useEffect(() => {
        const fetchCalendars = async () => {
            try {
                const response = await ScheduleApi.getStartDateByTourId(formData.tourId);

                if (response?.code === 1607 && Array.isArray(response.result)) {
                    const dates = response.result.map(item => new Date(item.startDate));
                    setDisabledDates(dates);
                }
            } catch (error) {
                console.error("Failed to fetch calendars: ", error);
            }
        }

        if (formData.tourId) {
            fetchCalendars();
        }
    }, [formData?.tourId])

    const calculateEndDate = (startDateStr, quantityDay) => {
        const quantity = parseInt(quantityDay, 10);
        if (!startDateStr || isNaN(quantity)) return null;
        
        const start = new Date(startDateStr);
        const end = new Date(start);
        end.setDate(start.getDate() + quantity - 1);

        return end;
    };    

    useEffect(() => {
        const end = calculateEndDate(formData.startDate, dataDate.quantityDay);
        
        if (end) {
            setDataDate((prev) => ({
                ...prev,
                endDate: end
            }));
        }
    }, [formData.startDate, dataDate.quantityDay]);
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            const response = await ScheduleApi.create(formData);

            if (response?.code === 1600) {
                SuccessToast("Thêm lịch trình thành công.");

                setFormData({
                    tourId: null,
                    startDate: getTodayUTC7().toISOString().split('T')[0],
                    totalPeople: null,
                    adultPrice: null,
                    childrenPrice: null
                });

                setDataDate({
                    quantityDay: null,
                    endDate: null
                })
            } else if (response?.code === 1027) {
                const date = getTodayUTC7();
                date.setDate(date.getDate() + 2);

                ErrorToast(`Ngày khởi hành không được trước ngày ${date.toLocaleDateString("vi-VN")}!`);
            } else {
                ErrorToast(response?.message || "Thêm lịch trình thất bại.");
            }
        } catch (error) {
            console.error("Failed to create schedule: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="schedule-insert-page px-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="card shadow col-md-7 col-xl-6">
                        <div className="card-body">
                            <h3 className="text-center mb-4 fw-bold">Thêm lịch trình</h3>
                            <form onSubmit={handleSubmit}>
                                <TourSelector formData={formData} setFormData={setFormData} setDataDate={setDataDate}/>

                                <div className="mb-3">
                                    <label className="form-label">Thời gian:</label>
                                    <input name="quantityDay" type="text" required value={dataDate.quantityDay || ""} onChange={handleChange} className="form-control" disabled/>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ngày khởi hành:</label>
                                    <DatePicker
                                        selected={formData.startDate || ""}
                                        onChange={(date) => handleDateChange(date, 'startDate')}
                                        className="form-control"
                                        dateFormat="dd-MM-yyyy"
                                        required
                                        excludeDates={disabledDates}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ngày kết thúc:</label>
                                    <DatePicker
                                        selected={dataDate.endDate || ""}
                                        className="form-control"
                                        dateFormat="dd-MM-yyyy"
                                        disabled
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Số người:</label>
                                    <input name="totalPeople" type="number" min="1" required value={formData.totalPeople || ""} onChange={handleChange} className="form-control" />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Giá người lớn:</label>
                                    <input name="adultPrice" type="number" min="1" required value={formData.adultPrice || ""} onChange={handleChange} className="form-control" />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Giá trẻ em:</label>
                                    <input name="childrenPrice" type="number" min="1" required value={formData.childrenPrice || ""} onChange={handleChange} className="form-control" />
                                </div>

                                <div className="d-flex justify-content-center gap-3">
                                    <button type="button" className="btn btn-back"
                                        onClick={() => {
                                            navigate("/manage/schedules");
                                        }}
                                    >
                                        <FaArrowLeft size={18} color="black" />
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn btn-submit fw-bold"
                                    >
                                        {isLoading ? 
                                            <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                            : 'Thêm'
                                        }
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

export default ScheduleInsertPage;