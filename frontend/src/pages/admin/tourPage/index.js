import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "./index.scss";
import { TourApi } from "services";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaPlus, FaSearch } from "react-icons/fa";
import { ErrorToast, SuccessToast } from "components/notifi";
import Pagination from "components/pagination";

const TourPage = () => {
    const [tours, setTours] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 9;
    const areasClassMap = {
        "b": "Miền Bắc",
        "t": "Miền Trung",
        "n": "Miền Nam"
    };
    const [loadingId, setLoadingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTours = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await TourApi.getAll({
                keyword: search.trim(),
                page: currentPage,
                size: pageSize,
            });
    
            if (response?.code === 1501) {
                setTours(response.result.content);
                setTotalPages(response.result.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch tours: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [search, currentPage, pageSize]);

    useEffect(() => {
        fetchTours();
    }, [currentPage, pageSize])

    const handleSearch = () => {
        setCurrentPage(0);
        setTotalPages(1);
        fetchTours();
    };

    const handleDelete = async (id, code) => {
        const confirm = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn xóa tour <b>${code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (confirm.isConfirmed) {
            setLoadingId(id);

            try {
                const response = await TourApi.delete(id);

                if (response?.code === 1504) {
                    SuccessToast(`Xóa tour ${code} thành công.`)
                    setTours(prevTours => prevTours.filter(tour => tour.id !== id));
                }
                else if (response?.code === 1049) {
                    ErrorToast(`Tour ${code} đang có lịch đặt đang xử lý.`);
                } else if (response?.code === 1029) {
                    ErrorToast(`Tour ${code} đang có lịch trình.`);
                }
                else {
                    ErrorToast(response?.message || `Xóa tour ${code} không thành công.`)
                }
            } catch (error) {
                console.error("Failed to delete tour: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            } finally {
                setLoadingId(null);
            }
        }
    };

    return (
        <div className="tour-manage-page">
            <div className="row">
                <div className="col-md-12 col-sm-12 ">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2>Danh sách Tours</h2>
                            <Link to={"/manage/tours/insert"}>
                                <span>
                                    <FaPlus className="me-1 mb-1" style={{ color: '#2A3F54', fontSize: '18px' }} />
                                    Thêm
                                </span>
                            </Link>

                            <div className="clearfix"></div>
                        </div>
                        <div className="x_content">
                            <div className="form-search">
                                <input
                                    className="mb-1"
                                    type="text"
                                    placeholder="Nhập mã, tên, điểm đến"
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
                                                    <th>Mã</th>
                                                    <th>Tên</th>
                                                    <th>Thời gian</th>
                                                    <th>Điểm đến</th>
                                                    <th>Khu vực</th>
                                                    <th>Lượt đặt</th>
                                                    <th colSpan={2}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan="8" style={{height: '350px', verticalAlign: 'middle'}}>
                                                            <span 
                                                                className="spinner-border spinner-border-sm mx-3 my-3 text-info" 
                                                                style={{ width: '30px', height: '30px'}} 
                                                                role="status"
                                                                aria-hidden="true"
                                                            ></span>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    tours.length > 0 && tours.map((item, index) => (
                                                        <tr key={index}>
                                                            <td> {index + 1} </td>
                                                            <td> {item.code} </td>
                                                            <td> {item.name} </td>
                                                            <td> {item.quantityDay ? `${item.quantityDay} ngày ${item.quantityDay-1} đêm`: ''} </td>
                                                            <td> {item.destination} </td>
                                                            <td> 
                                                                {areasClassMap[item.area] || ''}
                                                            </td>
                                                            <td> {item.quantityOrder} </td>
                                                            <td>
                                                                <Link to={`/manage/tours/edit/${item.id}`}>
                                                                    <FaEdit style={{ color: '#26B99A', fontSize: '20px' }} />
                                                                </Link>
                                                            </td>
                                                            <td>
                                                                <button type="button" disabled={loadingId === item.id} onClick={() => handleDelete(item.id, item.code)}>
                                                                    {loadingId === item.id ? 
                                                                        <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                                                        : <FaTrash style={{ color: 'red', fontSize: '18px' }} />
                                                                    }
                                                                </button>
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

export default TourPage;