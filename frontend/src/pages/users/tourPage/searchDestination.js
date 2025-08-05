import { tourBanner } from 'assets';
import Banner from 'components/banner';
import TourList from 'components/users/tour/TourList.js';
import { memo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TourApi } from 'services';

const SearchDestinationPage = () => {
    const [tours, setTours] = useState([]);
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 6;
    const [search, setSearch] = useState({
        destination: '',
        startDate: '',
        endDate: '',
        sort: 'default'
    });

    const onSortChange = (newSort) => {
        setSearch(prev => ({
            ...prev,
            sort: newSort
        }));
    }

    useEffect(() => {
        const fetchTourList = async () => {
            const queryParams = new URLSearchParams(location.search);
            const des = queryParams.get('des').trim() || '';
            const sd = queryParams.get('sd') || '';
            const ed = queryParams.get('ed') || '';

            try {
                const response = await TourApi.searchToursDestination(
                    {
                        ...search,
                        destination: des,
                        startDate: sd,
                        endDate: ed
                    },
                    currentPage, 
                    pageSize
                );

                if (response?.code === 1510) {
                    setTours(response?.result?.content);
                    setTotalPages(response?.result?.totalPages);
                }
            } catch (error) {
                console.error("Failed to fetch tours:", error);
            }
        };

        fetchTourList();
    }, [location.search, search.sort, currentPage]);

    return (
        <div className="tour-page">
            <Banner title={"Tours"} image={tourBanner} />

            <section className="tour-grid-page py-30 rel z-1">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-9">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="fw-bold small">Tìm thấy {tours.length} tours</div>

                                <div className="d-flex align-items-center gap-3">
                                    <span className="fw-bold small">Sắp xếp theo</span>
                                    <select
                                        className="form-select form-select-sm w-auto"
                                        value={search.sort}
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
}

export default memo(SearchDestinationPage);