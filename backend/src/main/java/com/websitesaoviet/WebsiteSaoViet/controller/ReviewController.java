package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.user.ReviewCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ReviewResponse;
import com.websitesaoviet.WebsiteSaoViet.service.AuthenticationService;
import com.websitesaoviet.WebsiteSaoViet.service.ReviewService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {
    ReviewService reviewService;
    AuthenticationService authenticationService;

    @PostMapping("/{bookingId}")
    ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @PathVariable String bookingId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody @Valid ReviewCreationRequest request
    ) {
        String accessToken = authHeader.substring(7);
        String customerId = authenticationService.getIdByToken(accessToken);

        ApiResponse<ReviewResponse> apiResponse = ApiResponse.<ReviewResponse>builder()
                .code(2000)
                .message("Thêm đánh giá mới thành công.")
                .result(reviewService.createReview(bookingId, customerId, request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{tourId}")
    ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(
            @PathVariable String tourId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String customerId = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);

            if (!accessToken.isBlank()) {
                customerId = authenticationService.getIdByToken(accessToken);
            }
        }

        ApiResponse<List<ReviewResponse>> apiResponse = ApiResponse.<List<ReviewResponse>>builder()
                .code(2001)
                .result(reviewService.getReviews(tourId, customerId))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<String>> deleteReview(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader
    ){
        String accessToken = authHeader.substring(7);
        String customerId = authenticationService.getIdByToken(accessToken);

        reviewService.deleteReview(id, customerId);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(2002)
                .message("Xóa đánh giá thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/check/{bookingId}")
    ResponseEntity<ApiResponse<Boolean>> checkReview(
            @PathVariable String bookingId,
            @RequestHeader("Authorization") String authHeader
    ) {
        String accessToken = authHeader.substring(7);
        String customerId = authenticationService.getIdByToken(accessToken);

        ApiResponse<Boolean> apiResponse = ApiResponse.<Boolean>builder()
                .code(2003)
                .result(reviewService.checkReview(bookingId, customerId))
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}