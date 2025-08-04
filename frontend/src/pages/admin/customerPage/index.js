import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "./index.scss";
import { CustomerApi } from "@services";
import formatDatetime from "@utils/formatDatetime.js";
import { FaTrash, FaLock, FaLockOpen, FaSearch, FaShieldAlt } from "react-icons/fa";
import { ErrorToast, SuccessToast } from "@components/notifi";
import { ToastContainer } from "react-toastify";
import Pagination from "@components/pagination";

const CustomerPage = () => {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 6;
    const [isLoading, setIsLoading] = useState(true);
    const statusClassMap = {
        "Đang hoạt động": "activate",
        "Chưa kích hoạt": "inactivate",
        "Bị khóa": "blocked"
    }

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await CustomerApi.getAll({
                keyword: search.trim(),
                page: currentPage,
                size: pageSize,
            });
    
            if (response?.code === 1301) {
                setCustomers(response.result.content);
                setTotalPages(response.result.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch customers: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [search, currentPage, pageSize]);

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, pageSize])

    const handleSearch = () => {
        setCurrentPage(0);
        fetchCustomers();
    };

    const handleDelete = async (id, code) => {
        const confirm = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn xóa khách hàng <b>${code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (confirm.isConfirmed) {
            try {
                const response = await CustomerApi.delete(id);

                if (response?.code === 1305) {
                    SuccessToast(`Xóa khách hàng ${code} thành công.`)
                    setCustomers(customers.filter(customer => customer.id !== id));
                }
                else if (response?.code === 1049) {
                    ErrorToast(`Khách hàng ${code} đang có lịch đặt đang xử lý.`);
                }
                else {
                    ErrorToast(response?.message || `Xóa khách hàng ${code} không thành công.`)
                }
            } catch (error) {
                console.error("Failed to delete customer: ", error)
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            }
        }
    };

    const handleLock = async (id, code) => {
        const confirm = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn khóa khách hàng <b>${code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (confirm.isConfirmed) {
            try {
                const response = await CustomerApi.lock(id);

                if (response?.code === 1308) {
                    SuccessToast(`Khóa khách hàng ${code} thành công.`)
                    setCustomers(customers.map(customer => 
                        customer.id === id ? { ...customer, status: 'Bị khóa' } : customer
                    ));
                }
                else {
                    ErrorToast(`Khóa khách hàng ${code} không thành công.`)
                }
            } catch (error) {
                console.error("Failed to lock customer: ", error)
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            }
        }
    };

    const handleUnLock = async (id, code) => {
        const confirm = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn mở khóa khách hàng <b>${code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (confirm.isConfirmed) {
            try {
                const response = await CustomerApi.unlock(id);

                if (response?.code === 1309) {
                    SuccessToast(`Mở khóa khách hàng ${code} thành công.`)
                    setCustomers(customers.map(customer => 
                        customer.id === id ? { ...customer, status: 'Đang hoạt động' } : customer
                    ));
                }
                else {
                    ErrorToast(`Mở khóa khách hàng ${code} không thành công.`)
                }
            } catch (error) {
                console.error("Failed to unlock customer: ", error)
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            }
        }
    };

    const handleActivate = async (id, code) => {
        const confirm = await Swal.fire({
            title: "Xác nhận",
            html: `Bạn có chắc chắn kích hoạt khách hàng <b>${code}</b> không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (confirm.isConfirmed) {
            try {
                const response = await CustomerApi.activate(id);

                if (response?.code === 1307) {
                    SuccessToast(`Kích hoạt khách hàng ${code} thành công.`)
                    setCustomers(customers.map(customer => 
                        customer.id === id ? { ...customer, status: 'Đang hoạt động' } : customer
                    ));
                }
                else {
                    ErrorToast(`Kích hoạt khách hàng ${code} không thành công.`)
                }
            } catch (error) {
                console.error("Failed to unlock customer: ", error)
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.")
            }
        }
    };

    if (isLoading) {
        return (
            <div style={{height: 1000}}></div>
        );
    }

    return (
        <div className="customer-manage-page">
            <div className="row">
                <div className="col-md-12 col-sm-12 ">
                    <div className="x_panel">
                        <div className="x_title">
                            <h2>Danh sách khách hàng</h2>
                            <div className="clearfix"></div>
                        </div>
                        <div className="x_content">
                            <div className="form-search">
                                <input
                                    type="search"
                                    placeholder="Nhập mã, tên, email, sđt"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
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
                                                    <th>Họ tên</th>
                                                    <th>Điện thoại</th>
                                                    <th>Email</th>
                                                    <th>Thời gian tạo</th>
                                                    <th>Trạng thái</th>
                                                    <th colSpan={2}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customers.length > 0 && customers.map((item, index) => (
                                                    <tr key={index}>
                                                        <td> {index + 1} </td>
                                                        <td> {item.code} </td>
                                                        <td> {item.fullName} </td>
                                                        <td> {item.phone} </td>
                                                        <td> {item.email} </td>
                                                        <td> {item.registeredTime ? formatDatetime(item.registeredTime) : ''} </td>
                                                        <td className={statusClassMap[item.status] || ''}>
                                                            {item.status}
                                                        </td>
                                                        <td>
                                                            {item.status === "Chưa kích hoạt" && (
                                                                <button type="button" onClick={() => handleActivate(item.id, item.code)}>
                                                                    <FaShieldAlt size={20} color="green" />
                                                                </button>
                                                            )}
                                                            {item.status === "Bị khóa" && (
                                                                <button type="button" onClick={() => handleUnLock(item.id, item.code)}>
                                                                    <FaLock size={20} color="#26B99A" />
                                                                </button>
                                                            )}
                                                            {item.status === "Đang hoạt động" && (
                                                                <button type="button" onClick={() => handleLock(item.id, item.code)}>
                                                                    <FaLockOpen size={20} color="#26B99A" />
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button type="button" onClick={() => handleDelete(item.id, item.code)}>
                                                                <FaTrash style={{ color: 'red', fontSize: '18px' }} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
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

            <ToastContainer />
        </div> 
    );
};

export default CustomerPage;