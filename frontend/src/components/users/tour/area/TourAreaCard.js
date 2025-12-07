import { noImage } from 'assets';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import formatCurrency from 'utils/formatCurrency.js';
import formatDatetime from 'utils/formatDatetime.js';

const TourAreaCard = ({ tour }) => {
    return (
        <div className="tour-card-custom col-xl-4 col-md-6">
            <div className="destination-item tour-grid style-three bgc-lighter block_tours equal-block-fix" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                <div className="image">
                    <i className="fas fa-heart heart" />
                    <img src={tour.image ? tour.image : noImage} alt="tour-image" />
                </div>

                <div className="content equal-content-fix">
                    <div className="destination-header">
                        <span className="location">
                            <i className="fal fa-map-marker-alt"></i> {tour.destination}
                        </span>

                        <div className="ratting">
                            {[...Array(5)].map((_, i) =>
                                i < tour.rating ? (
                                    <i key={i} className="fas fa-star"></i>
                                ) : (
                                    <i key={i} className="far fa-star"></i>
                                )
                            )}
                        </div>
                    </div>
                    <h6 className="fw-bold mb-2">{tour.name}</h6>
                    <ul className="blog-meta">
                        <li><i className="far fa-clock"></i> {tour.quantityDay} ngày {tour.quantityDay-1} đêm</li>
                        <li><i className="far fa-user"></i> {tour.people}</li>
                    </ul>
                    <ul className="blog-meta">
                        <li>
                            <i className="fa-solid fa-plane-departure me-2"></i>
                            {tour.startDate ? formatDatetime(tour.startDate) : ''}
                        </li>
                    </ul>
                    <ul className="blog-meta">
                        <li>
                            <i className="fas fa-plane-arrival me-2"></i>
                            {tour.endDate ? formatDatetime(tour.endDate) : ''}
                        </li>
                    </ul>
                    <div className="destination-footer">
                        <span className="price">
                            <span>{formatCurrency(tour.adultPrice)}</span> / người
                        </span>
                        <Link to={`/tour/detail/${tour.id}`} className="theme-btn style-two style-three">
                            <i className="fal fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(TourAreaCard);