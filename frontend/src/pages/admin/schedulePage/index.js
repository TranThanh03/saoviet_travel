import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { ScheduleApi } from "services";
import formatDatetime from "utils/formatDatetime.js";
import "./index.scss";
import formatCurrency from "utils/formatCurrency.js";
import { FaTrash, FaEdit, FaPlus, FaSearch } from "react-icons/fa";
import { ErrorToast, SuccessToast } from "components/notifi";
import Pagination from "components/pagination";
import { Link } from "react-router-dom";

const SchedulePage = () => {
    const [schedules, setSchedules] = useState([]);
    const [search, setSearch] = useState("");
    const [showEdit, setShowEdit] = useState(false);
    const [editSchedule, setEditSchedule] = useState({});
    const [totalPeopleEdit, setTotalPeopleEdit] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 9;
    const statusClassMap = {
        "Chưa diễn ra": "not-started",
        "Đang diễn ra": "ongoing",
        "Đã kết thúc": "ended"
    };
    const [loadingId, setLoadingId] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const fetchSchedules = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await ScheduleApi.getAll({ 
                keyword: search.trim(),
                page: currentPage,
                size: pageSize,
            });

            if (response?.code === 1601) {
                setSchedules(response.result.content);
                setTotalPages(response.result.totalPages);
            } else if (response?.code === 1057) {
                ErrorToast('Thời gian phải có định dạng kiểu "dd-mm-yyyy".');
            }
        } catch (error) {
            console.error("Failed to fetch schedules: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [search, currentPage, pageSize]);

    useEffect(() => {
        fetchSchedules();
    }, [currentPage, pageSize]);

    const handleSearch = () => {
        setCurrentPage(0);
        setTotalPages(1);
        fetchSchedules();
    };

    const handleDelete = async (id, code) => {
        const confirm = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn xóa lịch <b>${code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (confirm.isConfirmed) {
            setLoadingId(id);

            try {
                const response = await ScheduleApi.delete(id);

                if (response?.code === 1606) {
                    SuccessToast(`Xóa lịch ${code} thành công.`)
                    setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.id !== id));
                }
                else if (response?.code === 1049) {
                    ErrorToast(`Lịch ${code} đang có lịch đặt đang xử lý.`);
                }
                else if (response?.code === 1061) {
                    ErrorToast(`Lịch ${code} đang có lịch đặt.`);
                }
                else {
                    ErrorToast(response?.message || `Xóa lịch ${code} không thành công.`)
                }
            } catch (error) {
                console.log("Failed to delete schedule: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            } finally {
                setLoadingId(null);
            }
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        
        if (totalPeopleEdit === 0) {
            ErrorToast("Vui lòng thay đổi số lượng người.")
            return;
        }
        
        setUpdateLoading(true);

        try {
            const response = await ScheduleApi.update(editSchedule.id, { totalPeople: totalPeopleEdit});
           
            if (response?.code === 1605) {
                setSchedules(
                    schedules.map(schedule =>
                        schedule.id === editSchedule.id ? { ...schedule, totalPeople: totalPeopleEdit } : schedule
                    )
                );
                setTotalPeopleEdit(0);

                SuccessToast(`Cập nhật lịch trình ${editSchedule.code} thành công.`);
            } else {
                ErrorToast(response?.message || `Cập nhật lịch trình ${editSchedule.code} không thành công.`);
            }
        } catch (error) {
            console.error("Failed to update schedule: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleShowEdit = (schedule) => {
        setEditSchedule(schedule);
        setShowEdit(true);
    };

    return (
        <div className="schedule-manage-page">
            <div className="row">
                <div className="col-md-12 col-sm-12 ">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2>Danh sách lịch trình</h2>
                            <Link to={"/manage/schedules/insert"}>
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
                                    placeholder="Nhập mã lịch, mã tour, ngày khởi hành"
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
                                                    <th>Mã lịch</th>
                                                    <th>Mã tour</th>
                                                    <th>Ngày khởi hành</th>
                                                    <th>Ngày kết thúc</th>
                                                    <th>Số người</th>
                                                    <th>Tổng người</th>
                                                    <th>Giá người lớn</th>
                                                    <th>Giá trẻ em</th>
                                                    <th>Trạng thái</th>
                                                    <th colSpan={2}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan="11" style={{height: '350px', verticalAlign: 'middle'}}>
                                                            <span 
                                                                className="spinner-border spinner-border-sm mx-3 my-3 text-info" 
                                                                style={{ width: '30px', height: '30px'}} 
                                                                role="status"
                                                                aria-hidden="true"
                                                            ></span>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    schedules.length > 0 && schedules.map((item, index) => (
                                                        <tr key={index}>
                                                            <td> {index + 1} </td>
                                                            <td> {item.code} </td>
                                                            <td> {item.tourCode} </td>
                                                            <td> {item.startDate ? formatDatetime(item.startDate) : ''} </td>
                                                            <td> {item.endDate ? formatDatetime(item.endDate) : ''} </td>
                                                            <td> {item.quantityPeople} </td>
                                                            <td> {item.totalPeople} </td>
                                                            <td className="color-red"> {item.adultPrice ? formatCurrency(item.adultPrice) : 0} </td>
                                                            <td className="color-red"> {item.childrenPrice ? formatCurrency(item.childrenPrice) : 0} </td>
                                                            <td className={statusClassMap[item.status] || ''}> 
                                                                {item.status}
                                                            </td>
                                                            <td>
                                                                {item.status === "Chưa diễn ra" && (
                                                                    <button type="button" onClick={() => handleShowEdit(item)}>
                                                                        <FaEdit style={{ color: '#26B99A', fontSize: '20px' }} />
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {item.status !== "Đang diễn ra" && (
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
                                                                )}
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

            {showEdit && (
                <div className="form-input-custom">
                    <div className="container">
                        <div className="row col-7 col-lg-5">
                            <div className="content bg-white p-4 rounded shadow">
                                <h2 className="text-center mb-4">Cập nhật lịch trình</h2>
                                <button type="button" className="btn-close position-absolute top-0 end-0 m-3" aria-label="Close"
                                    onClick={() => {
                                        setShowEdit(false);
                                    }}
                                ></button>
                        
                                <form onSubmit={handleEdit}>
                                    <div className="mb-3">
                                        <label className="form-label">Mã lịch trình:</label>
                                        <input type="text" name="code" className="form-control" disabled
                                            defaultValue={editSchedule.code || ''}
                                        />
                                    </div>
                        
                                    <div className="mb-3">
                                        <label className="form-label">Số người đã đặt:</label>
                                        <input type="text" name="quantityPeople" className="form-control" disabled
                                            defaultValue={editSchedule.quantityPeople || 0}
                                        />
                                    </div>
                        
                                    <div className="mb-3">
                                        <label className="form-label">Số người tối đa:</label>
                                        <input type="number" name="totalPeople" min={1} className="form-control" required
                                            defaultValue={editSchedule.totalPeople || ''}  onChange={(e) => setTotalPeopleEdit(Number(e.target.value))}
                                        />
                                    </div>
                        
                                    <button type="submit" disabled={updateLoading} className="btn btn-submit w-100 mt-4 text-white">
                                        {updateLoading ? 
                                            <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
                                            : 'Cập nhật'
                                        }
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchedulePage;