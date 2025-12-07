import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "./index.scss";
import { NewsApi } from "services";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaPlus, FaSearch } from "react-icons/fa";
import { ErrorToast, SuccessToast } from "components/notifi";
import Pagination from "components/pagination";
import formatDatetime from "utils/formatDatetime.js";
import { noImage } from "assets";

const NewsPage = () => {
    const [news, setNews] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 9;
    const [loadingId, setLoadingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNews = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await NewsApi.getAll({
                keyword: search.trim(),
                page: currentPage,
                size: pageSize,
            });
    
            if (response?.code === 2101) {
                setNews(response.result.content);
                setTotalPages(response.result.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch news: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [search, currentPage, pageSize]);

    useEffect(() => {
        fetchNews();
    }, [currentPage, pageSize])

    const handleSearch = () => {
        setCurrentPage(0);
        setTotalPages(1);
        fetchNews();
    };

    const handleDelete = async (id, code) => {
        const confirm = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn xóa tin tức <b>${code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (confirm.isConfirmed) {
            setLoadingId(id);

            try {
                const response = await NewsApi.delete(id);

                if (response?.code === 2104) {
                    SuccessToast(`Xóa tin tức ${code} thành công.`)
                    setNews(prevNews => prevNews.filter(news => news.id !== id));
                }
                else {
                    ErrorToast(response?.message || `Xóa tin tức ${code} không thành công.`)
                }
            } catch (error) {
                console.error("Failed to delete news: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            } finally {
                setLoadingId(null);
            }
        }
    };

    return (
        <div className="news-manage-page">
            <div className="row">
                <div className="col-md-12 col-sm-12 ">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2>Danh sách tin tức</h2>
                            <Link to={"/manage/news/insert"}>
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
                                    type="search"
                                    placeholder="Nhập mã, tiêu đề"
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
                                                    <th>Hình ảnh</th>
                                                    <th>Thể loại</th>
                                                    <th>Lượt truy cập</th>
                                                    <th>Thời gian tạo</th>
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
                                                    news.length > 0 && news.map((item, index) => (
                                                        <tr key={index}>
                                                            <td> {index + 1} </td>
                                                            <td> {item.code} </td>
                                                            <td> {item.title} </td>
                                                            <td>
                                                                <img className="image" src={item.image || noImage} alt="news" />
                                                            </td>
                                                            <td> {item.type} </td>
                                                            <td> {item.viewCount} </td>
                                                            <td> {item.timeStamp ? formatDatetime(item.timeStamp) : ''} </td>
                                                            <td>
                                                                <Link to={`/manage/news/edit/${item.id}`}>
                                                                    <FaEdit style={{ color: '#26B99A', fontSize: '20px' }} />
                                                                </Link>
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

export default NewsPage;