import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "./index.scss";
import { PromotionApi } from "services";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaPlus, FaSearch } from "react-icons/fa";
import { ErrorToast, SuccessToast } from "components/notifi";
import Pagination from "components/pagination";
import formatCurrency from "utils/formatCurrency.js";
import formatDatetime from "utils/formatDatetime.js";

const PromotionPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 9;
    const statusClassMap = {
        "Chưa diễn ra": "not-started",
        "Đang diễn ra": "ongoing",
        "Đã kết thúc": "ended"
    };
    const [loadingId, setLoadingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPromotions = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await PromotionApi.getAll({
                keyword: search.trim(),
                page: currentPage,
                size: pageSize,
            });
    
            if (response?.code === 1701) {
                setPromotions(response.result.content);
                setTotalPages(response.result.totalPages);
            } else if (response?.code === 1057) {
                ErrorToast('Thời gian phải có định dạng kiểu "dd-mm-yyyy".');
            }
        } catch (error) {
            console.error("Failed to fetch promotions: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [search, currentPage, pageSize]);

    useEffect(() => {
        fetchPromotions();
    }, [currentPage, pageSize])

    const handleSearch = () => {
        setCurrentPage(0);
        setTotalPages(1);
        fetchPromotions();
    };

    const handleDelete = async (id, code) => {
        const confirm = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn xóa khuyến mãi <b>${code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (confirm.isConfirmed) {
            setLoadingId(id);

            try {
                const response = await PromotionApi.delete(id);

                if (response?.code === 1705) {
                    SuccessToast(`Xóa khuyến mãi ${code} thành công.`)
                    setPromotions(prevPromotions => prevPromotions.filter(promotion => promotion.id !== id));
                }
                else {
                    ErrorToast(response?.message || `Xóa khuyến mãi ${code} không thành công.`)
                }
            } catch (error) {
                console.error("Failed to delete promotion: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            } finally {
                setLoadingId(null);
            }
        }
    };

    return (
        <div className="promotion-manage-page">
            <div className="row">
                <div className="col-md-12 col-sm-12 ">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2>Danh sách khuyến mãi</h2>
                            <Link to={"/manage/promotions/insert"}>
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
                                    placeholder="Nhập mã, ngày bắt đầu"
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
                                                    <th>Tiêu đề</th>
                                                    <th>Ngày bắt đầu</th>
                                                    <th>Ngày kết thúc</th>
                                                    <th>Giảm giá</th>
                                                    <th>Số lượng</th>
                                                    <th>Trạng thái</th>
                                                    <th colSpan={2}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan="9" style={{height: '350px', verticalAlign: 'middle'}}>
                                                            <span 
                                                                className="spinner-border spinner-border-sm mx-3 my-3 text-info" 
                                                                style={{ width: '30px', height: '30px'}} 
                                                                role="status"
                                                                aria-hidden="true"
                                                            ></span>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    promotions.length > 0 && promotions.map((item, index) => (
                                                        <tr key={index}>
                                                            <td> {index + 1} </td>
                                                            <td> {item.code} </td>
                                                            <td> {item.title} </td>
                                                            <td> {item.startDate ? formatDatetime(item.startDate) : ''} </td>
                                                            <td> {item.endDate ? formatDatetime(item.endDate) : ''} </td>
                                                            <td className="color-red"> {item.discount ? formatCurrency(item.discount) : 0}</td>
                                                            <td> {item.quantity} </td>
                                                            <td className={statusClassMap[item.status] || ''}> 
                                                                {item.status}
                                                            </td>
                                                            <td>
                                                                {item.status !== 'Đã kết thúc' && (
                                                                    <Link to={`/manage/promotions/edit/${item.id}`}>
                                                                        <FaEdit style={{ color: '#26B99A', fontSize: '20px' }} />
                                                                    </Link>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    disabled={loadingId === item.id}
                                                                    onClick={() => handleDelete(item.id, item.code)}
                                                                >
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

export default PromotionPage;