import { memo, useState, useEffect } from 'react';
import { TourApi } from 'services';
import TourList from 'component/users/tour/TourList.js';
import { tourBanner } from 'assets';
import Banner from 'component/banner';
import './index.scss';
import TourSidebar from 'component/users/tour/TourSidebar.js';

const TourPage = () => {
    const [tours, setTours] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(9);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        price: null,
        area: null,
        rating: null,
        duration: null,
        sort: 'default',
    });

    const fetchTourList = async () => {
        try {
            const response = await TourApi.filter(filters, { page: currentPage, size: pageSize });

            if (response?.code === 1505) {
                setTours(response?.result?.content);
                setTotalPages(response?.result?.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch tours: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTourList();
    }, [filters, currentPage]);
    
    const updateFilter = (newFilters) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters
        }));
    }

    const onSortChange = (newSort) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            sort: newSort
        }));
    }

    if (isLoading) {
        return (
            <div style={{ height: 1000 }}></div>
        );
    }

    return (
        <div className="tour-page">
            <Banner title={"Tours"} image={tourBanner} />

            <section className="tour-grid-page py-30 rel z-1">
                <div className="container">
                    <div className="row">
                        <TourSidebar filters={filters} setFilters={updateFilter}/>

                        <div className="col-lg-9">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="fw-bold small">Tìm thấy {tours.length} tours</div>

                                <div className="d-flex align-items-center gap-3">
                                    <span className="fw-bold small">Sắp xếp theo</span>
                                    <select
                                        className="form-select form-select-sm w-auto"
                                        value={filters.sort}
                                        onChange={(e) => onSortChange(e.target.value)}
                                    >
                                        <option value="default">Mặc định</option>
                                        <option value="new">Mới nhất</option>
                                        <option value="old">Cũ nhất</option>
                                        <option value="high-to-low">Cao đến thấp</option>
                                        <option value="low-to-high">Thấp đến cao</option>
                                    </select>
                                </div>
                            </div>
                        
                            <TourList
                                tours={tours}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default memo(TourPage);