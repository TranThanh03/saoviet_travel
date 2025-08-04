import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SlideShow = ({ slides, interval = 3000 }) => {
    const nextBtnRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (nextBtnRef.current) {
                nextBtnRef.current.click();
            }
        }, interval);

        return () => clearTimeout(timer);
    }, [interval]);

    return (
        <div
            id="carouselExampleFade"
            className="carousel slide carousel-fade"
            data-bs-ride="carousel"
            data-bs-interval={interval}
            data-bs-pause="false"
        >
            <div className="carousel-inner">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`carousel-item ${index === 0 ? 'active' : ''}`}
                    >
                        <img
                            src={slide}
                            className="d-block w-100"
                            alt={`Slide ${index + 1}`}
                            style={{ height: '600px', objectFit: 'cover' }}
                        />
                    </div>
                ))}
            </div>

            <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleFade"
                data-bs-slide="prev"
            >
                <span className="carousel-control-prev-icon" />
                <span className="visually-hidden">Previous</span>
            </button>

            <button
                ref={nextBtnRef}
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleFade"
                data-bs-slide="next"
            >
                <span className="carousel-control-next-icon" />
                <span className="visually-hidden">Next</span>
            </button>

            <div className="carousel-indicators">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        data-bs-target="#carouselExampleFade"
                        data-bs-slide-to={index}
                        className={index === 0 ? 'active' : ''}
                        aria-current={index === 0}
                        aria-label={`Slide ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

SlideShow.propTypes = {
    slides: PropTypes.arrayOf(PropTypes.string).isRequired,
    interval: PropTypes.number,
};

export default SlideShow;