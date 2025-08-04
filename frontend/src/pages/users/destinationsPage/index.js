import { memo, useState, useEffect } from 'react';
import { desBanner } from 'assets';
import AnimatedCounter from 'components/counter';
import Banner from 'components/banner';
import TourAreaSidebar from 'components/users/tour/area/TourAreaSidebar.js';
import TourAreaList from 'components/users/tour/area/TourAreaList.js';
import { TourApi } from 'services';

const DestinationsPage = () => {
    const areafilters = [
        { label: 'Tất cả', value: null },
        { label: 'Miền Bắc', value: 'b' },
        { label: 'Miền Trung', value: 't' },
        { label: 'Miền Nam', value: 'n' },
    ];

    const [tours, setTours] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(9);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        price: null,
        area: null,
        startDate: null,
        endDate: null,
        duration: null,
        sort: 'default',
    });

    const fetchTourList = async () => {
        try {
            const response = await TourApi.filterArea(filters, { page: currentPage, size: pageSize });

            if (response?.code === 1511) {
                setTours(response?.result?.content);
                setTotalPages(response?.result?.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch tours: ", error);
        } finally {
            setLoading(false);
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

    const handleFilterChange = (field, value) => {
        setFilters({
            ...filters,
            [field]: value,
        });
    };

    if (isLoading) {
        return (
            <div style={{ height: 1000 }}></div>
        );
    }

    return (
        <div className='destinations-page'>
            <Banner title={"Điểm đến"} image={desBanner} />

            <section className="popular-destinations-area pt-50 pb-90 rel z-1">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-12">
                            <div className="section-title text-center counter-text-wrap mb-40" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                                <h2>Khám phá các điểm đến phổ biến</h2>

                                <p>Website <AnimatedCounter end={345} duration={2} className="plus" /> trải nghiệm phổ biến nhất mà bạn sẽ nhớ</p>
                                
                                <ul className="destinations-nav mt-30">
                                    {areafilters.map((item, index) => (
                                        <li key={index} className={filters.area === item.value ? 'active' : ''} onClick={() => handleFilterChange('area', item.value)}>
                                            {item.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row">
                            <TourAreaSidebar filters={filters} setFilters={updateFilter}/>
    
                            <div className="col-lg-9">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="fw-bold small">Tìm thấy {tours.length} tours</div>
    
                                    <div className="d-flex align-items-center gap-3">
                                        <span className="fw-bold small">Sắp xếp theo</span>
                                        <select
                                            className="form-select form-select-sm w-auto"
                                            value={filters.sort}
                                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                                        >
                                            <option value="default">Mặc định</option>
                                            <option value="new">Mới nhất</option>
                                            <option value="old">Cũ nhất</option>
                                            <option value="high-to-low">Cao đến thấp</option>
                                            <option value="low-to-high">Thấp đến cao</option>
                                        </select>
                                    </div>
                                </div>
                            
                                <TourAreaList
                                    tours={tours}
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default memo(DestinationsPage);