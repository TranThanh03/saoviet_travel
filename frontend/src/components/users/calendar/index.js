import { memo, useContext, useEffect, useState } from "react";
import "./index.scss";
import { ScheduleApi } from "services";
import { useNavigate } from "react-router-dom";
import { ErrorToast } from "components/notifi";
import { AuthContext } from "pages/users/theme/masterLayout";

const CalendarCustom = ({ tourId, onDateSelect, isShow, onClose }) => {
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [calendarData, setCalendarData] = useState([
        {
            id: '',
            startDate: '',
            endDate: '',
            adultPrice: 0,
            childrenPrice: 0,
            quantityPeople: 0,
            totalPeople: 0,
        }
    ]);
    const navigate = useNavigate();
    const { authenticated } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ScheduleApi.getByTourId(tourId);

                if (response?.code === 1603 && response?.result.length > 0) {
                    setCalendarData(response.result);
                }
            } catch (error) {
                console.log("Failed to fetch data: ", error);
            }
        };

        fetchData();
    }, [tourId]);

    useEffect(() => {
        if (isShow && !authenticated) {
            ErrorToast("Vui lòng đăng nhập để đặt tour.");

            setTimeout(() => {
                navigate("/auth/login");
            }, 1500);
        }
    }, [isShow]);

    const availableMonths = [...new Set(
        calendarData.map(item => {
            const [year, month] = item.startDate.split('-').map(Number);
            return `${year}-${month - 1}`;
        })
    )].map(str => {
        const [year, month] = str.split('-').map(Number);
        return { year, month };
    }).sort((a, b) => a.year - b.year || a.month - b.month);

    const currentMonthData = availableMonths[currentMonthIndex];
    const currentDate = new Date(currentMonthData.year, currentMonthData.month, 1);

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        if (currentMonthIndex > 0) {
            setCurrentMonthIndex(currentMonthIndex - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonthIndex < availableMonths.length - 1) {
            setCurrentMonthIndex(currentMonthIndex + 1);
        }
    };

    const handleDateClick = (data) => {
        setSelectedId(data.id);

        if (onDateSelect) {
            onDateSelect(data);
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const formatPrice = (price) => {
        if (price < 1000000) {
            return `${price / 1000}K`;
        } else {
            return `${(price / 1000000).toFixed(2)}M`;
        }
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < adjustedFirstDay; i++) {
            days.push(<div key={`empty-${i}`} className="day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const priceEntry = calendarData.find(entry => entry.startDate === dateStr);

            const isActive = priceEntry && priceEntry.id === selectedId;
            days.push(
                <div
                    key={day}
                    className={`day ${priceEntry ? 'has-price' : ''} ${isActive ? 'active' : ''}`}
                    onClick={() => {
                        if (priceEntry) {
                            handleDateClick(priceEntry);
                            handleClose();
                        }
                    }}
                >
                    {day}
                    {priceEntry && (
                        <span className="price">
                            {formatPrice(priceEntry.adultPrice)}
                        </span>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className={`calendar-container ${isShow ? 'show-custom' : ''}`}>
            <div className="calendar-header">
                <button onClick={handlePrevMonth} disabled={currentMonthIndex === 0}>←</button>
                <h2>Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}</h2>
                <button onClick={handleNextMonth} disabled={currentMonthIndex === availableMonths.length - 1}>→</button>
            </div>
            <div className="calendar-grid">
                <div className="day-name">T2</div>
                <div className="day-name">T3</div>
                <div className="day-name">T4</div>
                <div className="day-name">T5</div>
                <div className="day-name">T6</div>
                <div className="day-name">T7</div>
                <div className="day-name">CN</div>
                {renderCalendar()}
            </div>
            <div className="footer-text">
                Quý khách vui lòng chọn ngày phù hợp
            </div>
            <button className="close-btn" onClick={handleClose}>Đóng</button>
        </div>
    );
};

export default memo(CalendarCustom);