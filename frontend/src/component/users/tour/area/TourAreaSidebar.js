import { memo } from 'react';
import PriceFilter from '../PriceFilter.js';
import './TourAreaSidebar.scss';
import DatePicker from 'react-datepicker';

const TourAreaSidebar = ({ filters, setFilters }) => {
    const handleFilterChange = (field, value) => {
        setFilters({
            ...filters,
            [field]: value,
        });
    };

    return (
        <div className="tour-area-sidebar-custom col-lg-3 col-md-6 col-sm-10">
            <div className="shop-sidebar" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                <div className="div_filter_clear pb-2">
                    <button
                        className="clear_filter"
                        name="btn_clear"
                        onClick={() => setFilters({
                            price: null,
                            area: null,
                            startDate: null,
                            endDate: null,
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

                <div className="widget widget-date">
                    <h6 className="widget-title">Ngày khởi hành</h6>
                    <DatePicker
                        selected={filters.startDate}
                        onChange={(date) => handleFilterChange('startDate', date.toLocaleDateString('sv-SE'))}
                        className="datetimepicker-custom"
                        placeholderText="Chọn ngày đi"
                        dateFormat="dd-MM-yyyy"
                    />
                </div>

                <div className="widget widget-date">
                    <h6 className="widget-title">Ngày kết thúc</h6>
                    <DatePicker
                        selected={filters.endDate}
                        onChange={(date) => handleFilterChange('endDate', date.toLocaleDateString('sv-SE'))}
                        className="datetimepicker-custom"
                        placeholderText="Chọn ngày về"
                        dateFormat="dd-MM-yyyy"
                    />
                </div>

                <div className="widget widget-duration">
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
            </div>
        </div>
    );
};

export default memo(TourAreaSidebar);