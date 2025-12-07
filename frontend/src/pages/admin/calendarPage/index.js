import React, { useState, useEffect, memo, useCallback } from "react";
import "./style.scss";
import { BookingApi } from "services";
import formatCurrency from "utils/formatCurrency.js";
import formatDatetime from "utils/formatDatetime.js";
import { Link } from "react-router-dom";
import { FaEye, FaSearch } from "react-icons/fa";
import Pagination from "components/pagination";

const CalendarPage = () => {
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const pageSize = 9;

    const paymentClassMap = {
        "Đã thanh toán": "paid",
        "Chưa thanh toán": "unpaid",
    };
    const statusClassMap = {
        "Đã xác nhận": "confirm",
        "Đã hủy": "cancel",
        "Đang xử lý": "processing",
    };

    const fetchCalendars = useCallback(async () => {
        setIsLoading(true);
        
        try {
            const response = await BookingApi.getAll({
                keyword: search.trim(),
                page: currentPage,
                size: pageSize,
            });

            if (response?.code === 1810) {
                setBookings(response.result.content);
                setTotalPages(response.result.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch bookings: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [search, currentPage, pageSize]);

    useEffect(() => {
        fetchCalendars();
    }, [currentPage, pageSize]);

    const handleSearch = () => {
        setCurrentPage(0);
        setTotalPages(1);
        fetchCalendars();
    };

    return (
        <div className="calendar-manage-page">
            <div className="row">
                <div className="col-md-12 col-sm-12 ">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2>Danh sách lịch đặt</h2>
                            <div className="clearfix"></div>
                        </div>
                        <div className="x_content">
                            <div className="form-search">
                                <input
                                    type="search"
                                    placeholder="Nhập mã đơn, khách hàng, tour, lịch trình"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                />
                                <button type="button" onClick={handleSearch}>
                                    <FaSearch style={{ color: '#333', fontSize: '16px' }} />
                                </button>
                            </div>
                            <div className="clearfix"></div>

                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="card-box table-responsive">
                                        <table className="table table-striped table-bordered" >
                                            <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th>Mã lịch đặt</th>
                                                    <th>Mã khách hàng</th>
                                                    <th>Mã tour</th>
                                                    <th>Mã lịch trình</th>
                                                    <th>Tổng tiền</th>
                                                    <th>Thời gian đặt</th>
                                                    <th>Thanh toán</th>
                                                    <th>Trạng thái</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan="10" style={{height: '350px', verticalAlign: 'middle'}}>
                                                            <span 
                                                                className="spinner-border spinner-border-sm mx-3 my-3 text-info" 
                                                                style={{ width: '30px', height: '30px'}} 
                                                                role="status"
                                                                aria-hidden="true"
                                                            ></span>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    bookings.length > 0 && bookings.map((item, index) => (
                                                        <tr key={index}>
                                                            <td> {index + 1} </td>
                                                            <td> {item.code} </td>
                                                            <td> {item.customerCode} </td>
                                                            <td> {item.tourCode} </td>
                                                            <td> {item.scheduleCode} </td>
                                                            <td className="color-red"> {item.totalPrice ? formatCurrency(item.totalPrice) : 0} </td>
                                                            <td> {item.bookingTime ? formatDatetime(item.bookingTime) : ''} </td>
                                                            <td className={paymentClassMap[item.paymentStatus] || ""}> 
                                                                {item.paymentStatus}
                                                            </td>
                                                            <td className={statusClassMap[item.status] || ""}>
                                                                {item.status}
                                                            </td>
                                                            <td>
                                                                <Link to={`/manage/calendars/detail/${item.id}`}>
                                                                    <FaEye style={{ color: '#ffc107', fontSize: '20px' }} />
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(CalendarPage);