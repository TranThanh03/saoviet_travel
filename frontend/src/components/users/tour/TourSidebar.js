import { memo } from 'react';
import { pShape3, tourCta } from 'assets';
import PriceFilter from './PriceFilter.js';
import './TourSidebar.scss';

const TourSidebar = ({ filters, setFilters }) => {
    
    const handleFilterChange = (field, value) => {
        setFilters({
            ...filters,
            [field]: value,
        });
    };

    return (
        <div className="tour-sidebar-custom col-lg-3 col-md-6 col-sm-10">
            <div className="shop-sidebar">
                <div className="div_filter_clear pb-2">
                    <button
                        className="clear_filter"
                        name="btn_clear"
                        onClick={() => setFilters({
                            price: null,
                            area: null,
                            rating: null,
                            duration: null,
                            sort: 'default',
                        })}
                    >
                        Clear
                    </button>
                </div>

                <PriceFilter
                    maxPrice={20000000}
                    value={filters.price}
                    onChangeRange={(range) => handleFilterChange('price', range)}
                />

                <div className="widget widget-activity" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                    <h6 className="widget-title">Điểm đến</h6>
                    <ul className="radio-filter">
                        {[
                            { id: 'b', label: 'Miền Bắc'},
                            { id: 't', label: 'Miền Trung'},
                            { id: 'n', label: 'Miền Nam'}
                        ].map((item) => (
                            <li key={item.id}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="domain"
                                    id={item.id}
                                    value={item.id}
                                    checked={filters.area === item.id}
                                    onChange={(e) => handleFilterChange('area', e.target.value)}
                                />
                                <label htmlFor={item.id}>
                                    {item.label}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="widget widget-reviews" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                    <h6 className="widget-title">Đánh giá</h6>
                    <ul className="radio-filter">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <li key={star}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="filter_star"
                                    id={`${star}star`}
                                    value={star}
                                    checked={filters.rating === star.toString()}
                                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                                />
                                <label htmlFor={`${star}star`}>
                                    <span className="ratting">
                                        {[...Array(5)].map((_, i) => (
                                            <i key={i} className={`fas fa-star ${i >= star ? 'white' : ''}`}></i>
                                        ))}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="widget widget-duration" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                    <h6 className="widget-title">Thời gian</h6>
                    <ul className="radio-filter">
                        {[
                            { id: '2ngay3dem', value: '2', label: '2 ngày 1 đêm' },
                            { id: '3ngay2dem', value: '3', label: '3 ngày 2 đêm' },
                            { id: '4ngay3dem', value: '4', label: '4 ngày 3 đêm' }].map((item) => (
                            <li key={item.id}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="duration"
                                    id={item.id}
                                    value={item.value}
                                    checked={filters.duration === item.value}
                                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                                />
                                <label htmlFor={item.id}>{item.label}</label>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="widget widget-cta mt-30 banner-sidebar-custom" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                    <div className="content text-white">
                        <span className="h6">Khám phá Việt Nam</span>
                        <h3>Điểm đến du lịch tốt nhất</h3>
                        <a href="/destinations/index" className="theme-btn style-two bgc-secondary">
                            <span data-hover="Khám phá ngay">Khám phá ngay</span>
                            <i className="fal fa-arrow-right"></i>
                        </a>
                    </div>
                    <div className="image">
                        <img src={tourCta} alt="CTA" />
                    </div>
                    <div className="cta-shape">
                        <img src={pShape3} alt="Shape" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(TourSidebar);