import { memo } from 'react';
import TourCard from './TourCard.js';
import Pagination from 'component/pagination';

const TourList = ({ tours, totalPages, currentPage, setCurrentPage }) => {
    return (
        <div className="tour-grid-wrap">
            <div className="row" style={tours.length > 0 ? {} : { height: '428px' }}>
                {tours.length > 0 && tours.map((item, index) => (
                    <TourCard key={index} tour={item} />
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default memo(TourList);