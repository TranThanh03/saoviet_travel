import { userAvatar } from 'assets';
import { memo, useState, useEffect } from 'react';
import "./index.scss";
import formatDatetime from 'utils/formatDatetime.js';
import { SuccessToast, ErrorToast } from 'components/notifi';
import { ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import { ReviewApi } from 'services';

const ReviewList = ({ tourId, bookingId }) => {
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [ratingStats, setRatingStats] = useState({});
    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: ''
    });
    const [isReviewed, setReviewed] = useState(false);

    const fetchReview = async () => {
        try {
            const response = await ReviewApi.getAll(tourId);

            if (response?.code === 2001) {
                setReviews(response?.result);

                if (Array.isArray(response?.result) && response.result.length === 0) {
                    setAvgRating(0);
                }
            }
        } catch (error) {
            console.error("Failed to fetch reviews: ", error);
            setAvgRating(0);
        }
    }

    useEffect(() => {
        fetchReview();
    }, [tourId])

    useEffect(() => {
        const fetchCheck = async () => {
            if (bookingId != null) {
                try {
                    const response = await ReviewApi.check(bookingId);

                    if (response?.code === 2003 && response?.result === true) {
                        setReviewed(true);
                    }
                } catch (error) {
                    console.log("Failed to fetch check review: ", error);
                }
            }
        }
        
        fetchCheck();
    }, [bookingId])

    useEffect(() => {
        if (reviews.length > 0) {
            const total = reviews.reduce((sum, review) => sum + review.rating, 0);
            setAvgRating(total/reviews.length);

            const ratingCount = reviews.reduce((acc, review) => {
                acc[review.rating] = (acc[review.rating] || 0) + 1;
                return acc;
            }, {});

            setRatingStats(ratingCount); 
        }
    }, [reviews]);

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Xác nhận",
            html: "Bạn có chắc chắn xóa đánh giá này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        });

        if (confirm.isConfirmed) {
            try {
                const response = await ReviewApi.delete(id);

                if (response?.code === 2002) {
                    SuccessToast("Xóa đánh giá thành công.")
                    fetchReview();
                }
                else {
                    ErrorToast("Xóa đánh giá không thành công.")
                }
            } catch (error) {
                console.error("Failed to delete review: ", error);
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại.")
            }
        }
    }

    const handleInsert = async () => {
        try {
            const response = await ReviewApi.create(bookingId, newReview);

            if (response?.code === 2000) {
                SuccessToast("Thêm đánh giá thành công.");
                setReviewed(false);
                fetchReview();
            } else {
                ErrorToast(response?.message);
            }
        } catch (error) {
            console.error("Failed to fetch insert review: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.");
        }
    }

    return (
        <div className="review">
            <h3>Đánh giá của khách hàng</h3>
            <div className="clients-reviews bgc-black mt-30 mb-60">
                <div className="left" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                    <b>{parseFloat(avgRating.toFixed(1))}</b>
                    <span>({reviews.length} đánh giá)</span>
                    <div className="ratting">
                        {[...Array(5)].map((_, i) => (
                            <i
                                key={i}
                                className={i < Math.floor(avgRating) ? "fas fa-star" : "far fa-star"}
                            ></i>
                        ))}
                    </div>
                </div>

                {reviews.length > 0 && [5, 4, 3, 2, 1].map((star, index) => (
                    <div key={index} className="left breakdown" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                        <b>{star}</b>
                        <span>({ratingStats[star] || 0} đánh giá)</span>
                        <div className="ratting">
                            {[...Array(5)].map((_, i) => (
                                <i
                                    key={i}
                                    className={i < star ? "fas fa-star" : "far fa-star"}
                                ></i>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <h3>Ý kiến của khách hàng</h3>
            <div className="comments mt-30 mb-60" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                {reviews.length > 0 && (
                    reviews.map((item, index) => {
                        return (
                            <div key={index} className="comment-body">
                                <div className="author-thumb">
                                    <img src={userAvatar} alt="avatar" />
                                </div>
                                <div className="content">
                                    <h6>{item.fullName ?? `Khách hàng ${index + 1}`}</h6>
                                    <div className="ratting">
                                        {[...Array(5)].map((_, i) =>
                                            i < item.rating ? (
                                                <i key={i} className="fas fa-star"></i>
                                            ) : (
                                                <i key={i} className="far fa-star"></i>
                                            )
                                        )}
                                    </div>
                                    <span className="time">{formatDatetime(item.timeStamp)}</span>
                                    <p>{item.comment}</p>
                                </div>

                                {item.customer === true && (
                                    <div className="control">
                                        <button type="button" onClick={() => handleDelete(item.id)}>
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
            
            {isReviewed && (
                <>
                    <h3 className="{{ $checkDisplay }}">Thêm đánh giá</h3>
                    <div className="comment-form bgc-lighter z-1 rel mt-30" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                        <div className="comment-review-wrap">
                            <div className="comment-ratting-item">
                                <span className="title">Đánh giá:</span>
                                <div className="ratting" id="rating-stars">
                                    <div className="ratting" id="rating-stars">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <i
                                                key={value}
                                                className={value <= newReview.rating ? "fas fa-star" : "far fa-star"}
                                                data-value={value}
                                                onClick={() => setNewReview(prev => ({ ...prev, rating: value }))}
                                            ></i>
                                        ))}
                                    </div>

                                </div>
                            </div>

                        </div>
                        <hr className="mt-30 mb-40" />
                        <h5>Để lại phản hồi</h5>
                        <div className="row gap-20 mt-20">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="message">Nội dung:</label>
                                    <textarea className="form-control" id="message" rows="5" onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value}))}></textarea>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group mb-0">
                                    <button type="button" className="theme-btn bgc-secondary style-two" onClick={() => handleInsert()}>
                                        <span data-hover="Gửi đánh giá">Gửi đánh giá</span>
                                        <i className="fal fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <ToastContainer />
        </div>
    );
};

export default memo(ReviewList);
