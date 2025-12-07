package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.user.ReviewCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ReviewResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Review;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.mapper.ReviewMapper;
import com.websitesaoviet.WebsiteSaoViet.repository.ReviewRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewService {
    ReviewRepository reviewRepository;
    ReviewMapper reviewMapper;
    BookingService bookingService;

    public ReviewResponse createReview(String bookingId, String customerId, ReviewCreationRequest request) {
        var booking = bookingService.getBookingReviewValid(bookingId, customerId, true);

        if (booking == null) {
            throw new AppException(ErrorCode.REVIEW_INVALID);
        }

        bookingService.updateBookingByReview(bookingId, false);

        Review review = reviewMapper.createReview(request);

        review.setCustomerId(customerId);
        review.setTourId(booking.getTourId());
        review.setTimeStamp(LocalDateTime.now());

        return reviewMapper.toReviewResponse(reviewRepository.save(review));
    }

    public List<ReviewResponse> getReviews(String tourId, String customerId) {
        if (customerId != null) {
            return reviewRepository.findAllByTourIdWithCustomer(tourId, customerId);
        }

        return reviewRepository.findAllByTourId(tourId);
    }

    @Transactional
    public void deleteReview(String id, String customerId) {
        if (!reviewRepository.existsReviewByIdAndCustomerId(id, customerId)) {
            throw new AppException(ErrorCode.REVIEW_NOT_EXITED);
        }

        reviewRepository.deleteById(id);
    }

    public boolean checkReview(String bookingId, String customerId) {
        var booking = bookingService.getBookingReviewValid(bookingId, customerId, true);

        if (booking != null) {
            return true;
        }

        return false;
    }
}