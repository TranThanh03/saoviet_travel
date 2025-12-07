package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.user.BookingProcessionRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.*;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.BookingResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.BookingDetailResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.BookingSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.UrlCheckoutResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.*;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingController {
    BookingService bookingService;
    AuthenticationService authenticationService;
    TourService tourService;
    CustomerService customerService;

    @PostMapping("/process")
    CompletableFuture<ResponseEntity<ApiResponse<UrlCheckoutResponse>>> processBooking(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody BookingProcessionRequest request
    ) {
        String accessToken = authHeader.substring(7);

        return bookingService.processBooking(accessToken, request)
                .thenApply(result -> {
                    ApiResponse<UrlCheckoutResponse> apiResponse = ApiResponse.<UrlCheckoutResponse>builder()
                            .code(result.getResponseCode())
                            .message(result.getMessage())
                            .result(
                                    UrlCheckoutResponse.builder()
                                            .checkoutUrl(result.getCheckoutUrl())
                                            .build()
                            )
                            .build();

                    return ResponseEntity.ok(apiResponse);
                })
                .exceptionally(ex -> {
                    log.error("Process booking failed: ", ex);

                    ApiResponse<UrlCheckoutResponse> errorResponse = ApiResponse.<UrlCheckoutResponse>builder()
                            .code(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                            .message(ErrorCode.INTERNAL_SERVER_ERROR.getMessage())
                            .build();

                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                });
    }

    @GetMapping("/list")
    ResponseEntity<ApiResponse<List<BookingSummaryResponse>>> getBookingsByCustomerId(@RequestHeader("Authorization") String authHeader){
        String accessToken = authHeader.substring(7);
        String customerId = authenticationService.getIdByToken(accessToken);

        ApiResponse<List<BookingSummaryResponse>> apiResponse = ApiResponse.<List<BookingSummaryResponse>>builder()
                .code(1804)
                .result(bookingService.getBookingsByCustomerId(customerId))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<BookingDetailResponse>> getBookingById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id
    ) {
        String accessToken = authHeader.substring(7);
        String customerId = authenticationService.getIdByToken(accessToken);

        ApiResponse<BookingDetailResponse> apiResponse = ApiResponse.<BookingDetailResponse>builder()
                .code(1805)
                .result(bookingService.getBookingDetail(id, customerId))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/{id}/cancel")
    ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id
    ) {
        String accessToken = authHeader.substring(7);
        String customerId = authenticationService.getIdByToken(accessToken);

        bookingService.cancelBooking(id, customerId);

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .code(1806)
                .message("Hủy lịch đặt thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/{id}/cancel")
    ResponseEntity<ApiResponse<BookingResponse>> cancelBookingByAdmin(@PathVariable String id) {
        var result = bookingService.cancelBookingByAdmin(id);
        String message = "Đã hủy lịch đặt thành công.";

        if (result) {
            boolean mailSent = bookingService.sendInvoice(id, false);
            message = mailSent ? "Đã hủy thành công và đang gửi mail." : "Đã hủy thành công, nhưng gửi mail thất bại.";
        }

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .code(1807)
                .message(message)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/confirm")
    ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(@PathVariable String id) {
        bookingService.confirmBooking(id);
        boolean mailSent = bookingService.sendInvoice(id, true);

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .code(1808)
                .message(mailSent ? "Xác nhận thành công và đang gửi mail." : "Xác nhận thành công, nhưng gửi mail thất bại.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/reserve")
    ResponseEntity<ApiResponse<BookingResponse>> confirmReserve(@PathVariable String id) {
        bookingService.confirmReserve(id);

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .code(1809)
                .message("Xác nhận giữ chỗ thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("")
    ResponseEntity<ApiResponse<Page<BookingListResponse>>> getAllBookings(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        ApiResponse<Page<BookingListResponse>> apiResponse = ApiResponse.<Page<BookingListResponse>>builder()
                .code(1810)
                .result(bookingService.getBookings(keyword.trim(), pageable))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/detail")
    ResponseEntity<ApiResponse<BookingCheckoutDetailResponse>> getBookingCheckoutDetail(@PathVariable String id) {
        ApiResponse<BookingCheckoutDetailResponse> apiResponse = ApiResponse.<BookingCheckoutDetailResponse>builder()
                .code(1811)
                .result(bookingService.getBookingCheckoutDetail(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/info-count")
    ResponseEntity<ApiResponse<InfoCountsResponse>> getAllInfo() {
        long countTours = tourService.getCount();
        long countCustomers = customerService.getCount();
        long countBookings = bookingService.getCountBookings();
        long totalRevenue = bookingService.getTotalRevenue();

        InfoCountsResponse adminHomeResponse = new InfoCountsResponse(
                countTours, countCustomers, countBookings, totalRevenue);

        ApiResponse<InfoCountsResponse> apiResponse = ApiResponse.<InfoCountsResponse>builder()
                .code(1812)
                .result(adminHomeResponse)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/latest")
    ResponseEntity<ApiResponse<List<BookingsLatestResponse>>> getLatestBookings() {
        ApiResponse<List<BookingsLatestResponse>> apiResponse = ApiResponse.<List<BookingsLatestResponse>>builder()
                .code(1813)
                .result(bookingService.getBookingsLatest())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/top-popular")
    ResponseEntity<ApiResponse<List<PopularToursResponse>>> getTopPopularTours() {
        ApiResponse<List<PopularToursResponse>> apiResponse = ApiResponse.<List<PopularToursResponse>>builder()
                .code(1814)
                .result(bookingService.getTopPopularTours())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status-count")
    ResponseEntity<ApiResponse<BookingStatusCountsResponse>> getBookingStatusCounts() {
        ApiResponse<BookingStatusCountsResponse> apiResponse = ApiResponse.<BookingStatusCountsResponse>builder()
                .code(1815)
                .result(bookingService.getStatusCounts())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{year}/statistics")
    ResponseEntity<ApiResponse<List<BookingStatisticResponse>>> getBookingsStatisticsByMonth(@PathVariable Integer year) {
        ApiResponse<List<BookingStatisticResponse>> apiResponse = ApiResponse.<List<BookingStatisticResponse>>builder()
                .code(1816)
                .result(bookingService.getBookingStatisticByYear(year))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/payment-pending/count")
    ResponseEntity<ApiResponse<Integer>> getPaymentPendingCount(@RequestHeader("Authorization") String authHeader) {
        String accessToken = authHeader.substring(7);
        String customerId = authenticationService.getIdByToken(accessToken);

        ApiResponse<Integer> apiResponse = ApiResponse.<Integer>builder()
                .code(1817)
                .result(bookingService.getPaymentPendingCount(customerId))
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}