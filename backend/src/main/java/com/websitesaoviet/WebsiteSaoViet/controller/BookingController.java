package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.*;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.BookingResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.BookingDetailResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.BookingSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.service.AuthenticationService;
import com.websitesaoviet.WebsiteSaoViet.service.BookingService;
import com.websitesaoviet.WebsiteSaoViet.service.CustomerService;
import com.websitesaoviet.WebsiteSaoViet.service.TourService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class BookingController {
    BookingService bookingService;
    AuthenticationService authenticationService;
    TourService tourService;
    CustomerService customerService;

    @GetMapping("/list")
    ResponseEntity<ApiResponse<List<BookingSummaryResponse>>> getBookingsByCustomerId(@CookieValue("token") String token){
        String id = authenticationService.getIdByToken(token);

        ApiResponse<List<BookingSummaryResponse>> apiResponse = ApiResponse.<List<BookingSummaryResponse>>builder()
                .code(1801)
                .result(bookingService.getBookingsByCustomerId(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<BookingDetailResponse>> getBookingById(@PathVariable String id) {
        ApiResponse<BookingDetailResponse> apiResponse = ApiResponse.<BookingDetailResponse>builder()
                .code(1802)
                .result(bookingService.getBookingDetail(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/cancel/{id}")
    ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(@PathVariable String id) {
        bookingService.cancelBooking(id);

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .code(1803)
                .message("Hủy lịch đặt thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/confirm/{id}")
    ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(@PathVariable String id) {
        bookingService.confirmBooking(id);

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .code(1804)
                .message("Xác nhận lịch đặt thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/reserve/{id}")
    ResponseEntity<ApiResponse<BookingResponse>> confirmReserve(@PathVariable String id) {
        bookingService.confirmReserve(id);

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .code(1805)
                .message("Xác nhận giữ chỗ thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("")
    ResponseEntity<ApiResponse<Page<BookingListResponse>>> getAllBookings(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {

        Pageable pageable = PageRequest.of(page, size);

        ApiResponse<Page<BookingListResponse>> apiResponse = ApiResponse.<Page<BookingListResponse>>builder()
                .code(1806)
                .result(bookingService.getBookings(keyword.trim(), pageable))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/detail/{id}")
    ResponseEntity<ApiResponse<BookingCheckoutDetailResponse>> getBookingCheckoutDetail(@PathVariable String id) {
        ApiResponse<BookingCheckoutDetailResponse> apiResponse = ApiResponse.<BookingCheckoutDetailResponse>builder()
                .code(1807)
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
                .code(1808)
                .result(adminHomeResponse)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/latest")
    ResponseEntity<ApiResponse<List<BookingsLatestResponse>>> getLatestBookings() {
        ApiResponse<List<BookingsLatestResponse>> apiResponse = ApiResponse.<List<BookingsLatestResponse>>builder()
                .code(1809)
                .result(bookingService.getBookingsLatest())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/top-popular")
    ResponseEntity<ApiResponse<List<PopularToursResponse>>> getTopPopularTours() {
        ApiResponse<List<PopularToursResponse>> apiResponse = ApiResponse.<List<PopularToursResponse>>builder()
                .code(1810)
                .result(bookingService.getTopPopularTours())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status-count")
    ResponseEntity<ApiResponse<BookingStatusCountsResponse>> getBookingStatusCounts() {
        ApiResponse<BookingStatusCountsResponse> apiResponse = ApiResponse.<BookingStatusCountsResponse>builder()
                .code(1811)
                .result(bookingService.getStatusCounts())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/statistics/{year}")
    ResponseEntity<ApiResponse<List<BookingStatisticResponse>>> getBookingsStatisticsByMonth(@PathVariable Integer year) {
        ApiResponse<List<BookingStatisticResponse>> apiResponse = ApiResponse.<List<BookingStatisticResponse>>builder()
                .code(1812)
                .result(bookingService.getBookingStatisticByYear(year))
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}