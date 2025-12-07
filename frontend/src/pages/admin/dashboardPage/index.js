import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import "./index.scss";
import formatCurrency from "utils/formatCurrency.js";
import { BookingApi, TourApi } from "services";
import formatDatetime from "utils/formatDatetime.js";
import { Link } from "react-router-dom";
import getTodayUTC7 from "utils/getTodayUTC7";

const DashboardPage = () => {
    const [infoCounts, setInfoCounts] = useState({});
    const [bookingsLatest, setBookingsLatest] = useState([]);
    const [popularTours, setPopularTours] = useState([]);
    const currentYear = getTodayUTC7().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const years = [];
    const [isLoading, setIsLoading] = useState({
        infoCount: false,
        statusCount: false,
        areaCount: false,
        bookingLatest: false,
        popularTour: false,
        statistic: false
    });

    for (let y = 2025; y <= currentYear; y++) {
        years.push(y);
    }
    
    const [pieDataStatus, setPieDataStatus] = useState([
        { name: "Đang xử lý", value: 0, color: "#FFD700" },
        { name: "Đã xác nhận", value: 0, color: "#00C853" },
        { name: "Đã hủy", value: 0, color: "#FF3D00" },
    ]);

    const [pieDataArea, setPieDataArea] = useState([
        { name: "Miền Bắc", value: 0, color: "#003f5c" },
        { name: "Miền Trung", value: 0, color: "#2f4b7c" },
        { name: "Miền Nam", value: 0, color: "#665191" },
    ]);

    const [lineData, setLineData] = useState(
        Array.from({ length: 12 }, (_, i) => ({
            month: `Tháng ${i + 1}`,
            revenue: 0,
            canceled: 0,
            confirmed: 0
        }))
    );

    useEffect(() => {
        const fetchInfoCount = async () => {
            setIsLoading((pre) => ({ ...pre, infoCount: true }));

            try {
                const response = await BookingApi.infoCount();

                if (response?.code === 1812) {
                    setInfoCounts(response?.result);
                }
            } catch (error) {
                console.error("Failed to fetch info count: ", error);
            } finally {
                setIsLoading((pre) => ({ ...pre, infoCount: false }));
            }
        };

        fetchInfoCount();
    }, [])

    useEffect(() => {
        const fetchBookingStatusCount = async () => {
            setIsLoading((pre) => ({ ...pre, statusCount: true }));

            try {
                const response = await BookingApi.statusCount();

                if (response?.code === 1815 && response?.result) {
                    setPieDataStatus((prevData) =>
                        prevData.map((item) => {
                            if (item.name === "Đang xử lý") return { ...item, value: response.result.processing };
                            if (item.name === "Đã xác nhận") return { ...item, value: response.result.confirmed };
                            if (item.name === "Đã hủy") return { ...item, value: response.result.canceled };
                            
                            return item;
                        })
                    );
                }
            } catch(error) {
                console.error("Failed to fetch booking status count: ", error);
            } finally {
                setIsLoading((pre) => ({ ...pre, statusCount: false }));
            }
        }

        fetchBookingStatusCount();
    }, [])

    useEffect(() => {
        const fetchTourAreaCount = async () => {
            setIsLoading((pre) => ({ ...pre, areaCount: true }));

            try {
                const response = await TourApi.areaCount();

                if (response?.code === 1506 && response?.result) {
                    setPieDataArea((prevData) =>
                        prevData.map((item) => {
                            if (item.name === "Miền Bắc") return { ...item, value: response.result.totalNorth };
                            if (item.name === "Miền Trung") return { ...item, value: response.result.totalCentral };
                            if (item.name === "Miền Nam") return { ...item, value: response.result.totalSouth };
                            
                            return item;
                        })
                    );
                }
            } catch(error) {
                console.error("Failed to fetch tours area count: ", error);
            } finally {
                setIsLoading((pre) => ({ ...pre, areaCount: false }));
            }
        }

        fetchTourAreaCount();
    }, [])

    useEffect(() => {
        const fetchBookingsLatest = async () => {
            setIsLoading((pre) => ({ ...pre, bookingLatest: true }));

            try {
                const response = await BookingApi.latest();

                if (response?.code === 1813) {
                    setBookingsLatest(response?.result);
                }
            } catch (error) {
                console.error("Failed to fetch bookings latest: ", error);
            } finally {
                setIsLoading((pre) => ({ ...pre, bookingLatest: false }));
            }
        };

        fetchBookingsLatest();
    }, [])

    useEffect(() => {
        const fetchPopularTours = async () => {
            setIsLoading((pre) => ({ ...pre, popularTour: true }));
            
            try {
                const response = await BookingApi.popularTours();

                if (response?.code === 1814) {
                    setPopularTours(response?.result);
                }
            } catch (error) {
                console.error("Failed to fetch popular tours: ", error);
            } finally {
                setIsLoading((pre) => ({ ...pre, popularTour: false }));
            }
        };

        fetchPopularTours();
    }, [])

    useEffect(() => {
        const fetchBookingStatistic = async () => {
            setIsLoading((pre) => ({ ...pre, statistic: true }));

            try {
                const response = await BookingApi.getStatistics(selectedYear);

                if (response?.code === 1816 && response?.result) {
                    if (response.result.length === 0) {
                        const emptyData = Array.from({ length: 12 }, (_, i) => ({
                            month: `Tháng ${i + 1}`,
                            revenue: 0,
                            canceled: 0,
                            confirmed: 0,
                        }));
                        
                        setLineData(emptyData);
                    } else {
                        setLineData((prevData) =>
                            prevData.map((item) => {
                                const found = response.result.find((data) => data.month === Number(item.month.replace("Tháng ", "")));
                                
                                return found
                                    ? {
                                        ...item,
                                        revenue: Number(found.revenue) || 0,
                                        canceled: Number(found.canceled) || 0,
                                        confirmed: Number(found.confirmed) || 0
                                    }
                                    : {
                                        ...item,
                                        revenue: 0,
                                        canceled: 0,
                                        confirmed: 0
                                    };
                            })
                        )
                    }
                }
            } catch (error) {
                console.error("Failed to fetch statistics: ", error);
            } finally {
                setIsLoading((pre) => ({ ...pre, statistic: false }));
            }
        };

        fetchBookingStatistic();
    }, [selectedYear])

    return (
        <div className="dashboard-container-page">
            <div className="row" style={{ display: 'inline-block', width: '100%' }}>
                <div className="tile_count">
                    <div className="col-md-3 col-sm-4 tile_stats_count">
                        <span className="count_top">
                            <i className="fa fa-plane-departure me-2"></i>Tổng số tours
                        </span>
                        <div className="count green">
                            <i className="fa fa-sort-asc me-2"></i>
                            {isLoading.infoCount ? 
                                <span className="spinner-border spinner-border-sm mx-2 text-info" role="status" aria-hidden="true"></span>
                                : infoCounts.countTours
                            }
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-4 tile_stats_count">
                        <span className="count_top">
                            <i className="fa fa-user me-2"></i>Số khách hàng
                        </span>
                        <div className="count green">
                            <i className="fa fa-sort-asc me-2"></i>
                            {isLoading.infoCount ? 
                                <span className="spinner-border spinner-border-sm mx-2 text-info" role="status" aria-hidden="true"></span>
                                : infoCounts.countCustomers
                            }
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-4 tile_stats_count">
                        <span className="count_top">
                            <i className="fa fa-solid fa-calendar-days me-2"></i>Số lượt đặt thành công
                        </span>
                        <div className="count green">
                            <i className="fa fa-sort-asc me-2"></i>
                            {isLoading.infoCount ? 
                                <span className="spinner-border spinner-border-sm mx-2 text-info" role="status" aria-hidden="true"></span>
                                : infoCounts.countBookings
                            }
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-4 tile_stats_count">
                        <span className="count_top">
                            <i className="fas fa-money-bill-wave me-2"></i>Tổng doanh thu
                        </span>
                        <div className="count red">
                            {isLoading.infoCount ? 
                                <span className="spinner-border spinner-border-sm ms-5 text-info" role="status" aria-hidden="true"></span>
                                : (infoCounts.totalRevenue ? formatCurrency(infoCounts.totalRevenue) : 0)
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 col-sm-4">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2>Lịch đặt</h2>
                            <div className="clearfix"></div>
                        </div>
                        <div className="x_content">
                            <div className="pie-chart">
                                {isLoading.statusCount ? 
                                    <span
                                        className="spinner-border spinner-border-sm mx-2 text-info"
                                        style={{ width: '30px', height: '30px'}}
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    :
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieDataStatus}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius="80%"
                                                fill="#8884d8"
                                                dataKey="value"
                                                label
                                            >
                                                {pieDataStatus.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-sm-4">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2>Khu vực</h2>
                            <div className="clearfix"></div>
                        </div>
                        <div className="x_content">
                            <div className="pie-chart">
                                {isLoading.areaCount ? 
                                    <span
                                        className="spinner-border spinner-border-sm mx-2 text-info"
                                        style={{ width: '30px', height: '30px'}}
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    :
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieDataArea}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius="80%"
                                                fill="#8884d8"
                                                dataKey="value"
                                                label
                                            >
                                                {pieDataArea.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 d-flex">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2>Lịch đặt mới</h2>
                            <div className="clearfix"></div>
                        </div>
                        <div className="x_content">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã</th>
                                        <th>Họ tên</th>
                                        <th>Tổng tiền</th>
                                        <th>Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading.bookingLatest ?
                                        <tr>
                                            <td colSpan={5} style={{height: '350px', verticalAlign: 'middle'}}>
                                                <span
                                                    className="spinner-border spinner-border-sm mx-2 text-info"
                                                    style={{ width: '30px', height: '30px'}}
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                            </td>
                                        </tr>
                                        :
                                        bookingsLatest.length > 0 && bookingsLatest.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <Link className="ellipsis" to={`/manage/calendars/detail/${item.id}`}>{item.code}</Link>
                                                </td>
                                                <td>{item.username ?? ''}</td>
                                                <td className="color-red">{item.totalPrice ? formatCurrency(item.totalPrice) : 0}</td>
                                                <td style={{maxWidth: '108px'}}>{item.bookingTime ? formatDatetime(item.bookingTime) : ''}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 d-flex">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2 className="w-100">Tours phổ biến trong tháng</h2>
                            <div className="clearfix"></div>
                        </div>
                        <div className="x_content">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã</th>
                                        <th>Tên tour</th>
                                        <th>Lượt đặt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading.popularTour ?
                                        <tr>
                                            <td colSpan={4} style={{height: '350px', verticalAlign: 'middle'}}>
                                                <span
                                                    className="spinner-border spinner-border-sm mx-2 text-info"
                                                    style={{ width: '30px', height: '30px'}}
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                            </td>
                                        </tr>
                                        :
                                        popularTours.length > 0 && popularTours.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.code}</td>
                                                <td>{item.name}</td>
                                                <td>{item.quantityOrder}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2>Doanh thu theo tháng</h2>
                            <span className="year-custom">
                                Năm
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="ms-1"
                                >
                                    {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                    ))}
                                </select>
                            </span>
                            <div className="clearfix"></div>
                        </div>
                        <div className="x_content">
                            {isLoading.statistic && <span className="spinner-border spinner-border-sm mx-2 text-info position-absolute" style={{ width: '30px', height: '30px', top: '50%', left: '50%'}} role="status" aria-hidden="true"></span>}
                            <ResponsiveContainer width="100%" height={500} style={{ opacity: isLoading.statistic && '0.5'}}>
                                <LineChart data={lineData} margin={{ top: 30, right: 20, left: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis
                                        domain={
                                            lineData.every(item => Number(item.revenue) === 0) ? [0, 1] : [0, 'dataMax']
                                        }
                                        tickFormatter={(v) => v === 0 ? "0" : (v / 1_000_000).toLocaleString()}
                                        label={{ value: "Triệu VND", angle: -90, position: "insideLeft" }}
                                    />
                                    <Tooltip formatter={(value, name) => {
                                        if (name === "revenue") return [formatCurrency(value), "Doanh thu"];
                                        if (name === "confirmed") return [`${value} lịch`, "Lịch đặt xác nhận"];
                                        if (name === "canceled") return [`${value} lịch`, "Lịch đặt hủy"];
                                        return value;
                                    }} />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                                    <Line type="monotone" dataKey="confirmed" stroke="#4CAF50" />
                                    <Line type="monotone" dataKey="canceled" stroke="#F44336" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;