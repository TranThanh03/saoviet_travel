package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.TourCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.TourUpdateRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.FilterToursAreaRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.FilterToursRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.SearchToursDestinationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.SearchToursRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ListToursResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ToursSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.TourResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.*;
import com.websitesaoviet.WebsiteSaoViet.enums.CommonStatus;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.BookingService;
import com.websitesaoviet.WebsiteSaoViet.service.ScheduleService;
import com.websitesaoviet.WebsiteSaoViet.service.TourService;
import jakarta.validation.Valid;
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
@RequestMapping("/tours")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class TourController {
    TourService tourService;
    ScheduleService scheduleService;
    BookingService bookingService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping()
    ResponseEntity<ApiResponse<TourResponse>> createTour(@RequestBody @Valid TourCreationRequest request) {
        ApiResponse<TourResponse> apiResponse = ApiResponse.<TourResponse>builder()
                .code(1500)
                .message("Thêm tour mới thành công.")
                .result(tourService.createTour(request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    ResponseEntity<ApiResponse<Page<ToursSummaryResponse>>> getTours(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {

        Pageable pageable = PageRequest.of(page, size);

        ApiResponse<Page<ToursSummaryResponse>> apiResponse = ApiResponse.<Page<ToursSummaryResponse>>builder()
                .code(1501)
                .result(tourService.getTours(keyword, pageable))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<TourResponse>> getTourById(@PathVariable String id) {
        ApiResponse<TourResponse> apiResponse = ApiResponse.<TourResponse>builder()
                .code(1502)
                .result(tourService.getTourById(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    ResponseEntity<ApiResponse<TourResponse>> updateUser(@PathVariable String id, @RequestBody @Valid TourUpdateRequest request) {
        if (scheduleService.existsScheduleByTourIdAndStatus(id, CommonStatus.NOT_STARTED.getValue())) {
            throw new AppException(ErrorCode.TOUR_NOT_STARTED);
        }

        ApiResponse<TourResponse> apiResponse = ApiResponse.<TourResponse>builder()
                .code(1503)
                .message("Cập nhật thông tin tour thành công.")
                .result(tourService.updateTour(id, request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<String>> deleteTour(@PathVariable String id) {
        if (bookingService.existsByTourId(id)) {
            throw new AppException(ErrorCode.BOOKING_PROCESSING);
        }

        scheduleService.deleteByTourId(id);
        tourService.deleteTour(id);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1504)
                .message("Xóa tour thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/filter")
    ResponseEntity<ApiResponse<Page<FilterToursResponse>>> getFilterTours(
            @RequestBody FilterToursRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {

        ApiResponse<Page<FilterToursResponse>> apiResponse = ApiResponse.<Page<FilterToursResponse>>builder()
                .code(1505)
                .result(tourService.getFilteredTours(request, page, size))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/area-count")
    ResponseEntity<ApiResponse<AreaTourCountResponse>> getFilterTours() {
        ApiResponse<AreaTourCountResponse> apiResponse = ApiResponse.<AreaTourCountResponse>builder()
                .code(1506)
                .result(tourService.getCountToursByArea())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/popular")
    ResponseEntity<ApiResponse<List<PopularToursResponse>>> getPopularTours() {
        ApiResponse<List<PopularToursResponse>> apiResponse = ApiResponse.<List<PopularToursResponse>>builder()
                .code(1507)
                .result(tourService.getPopularTours())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/search")
    ResponseEntity<ApiResponse<Page<SearchToursResponse>>> getSearchTours(
            @RequestBody SearchToursRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        ApiResponse<Page<SearchToursResponse>> apiResponse = ApiResponse.<Page<SearchToursResponse>>builder()
                .code(1509)
                .result(tourService.getSearchTours(request, page, size))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/search-destination")
    ResponseEntity<ApiResponse<Page<SearchToursResponse>>> getSearchToursByDestination(
            @RequestBody SearchToursDestinationRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        ApiResponse<Page<SearchToursResponse>> apiResponse = ApiResponse.<Page<SearchToursResponse>>builder()
                .code(1510)
                .result(tourService.getSearchToursByDestination(request, page, size))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/filter-area")
    ResponseEntity<ApiResponse<Page<FilterToursAreaResponse>>> getFilterToursByArea(
            @RequestBody FilterToursAreaRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {

        ApiResponse<Page<FilterToursAreaResponse>> apiResponse = ApiResponse.<Page<FilterToursAreaResponse>>builder()
                .code(1511)
                .result(tourService.getFilteredToursByArea(request, page, size))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/similar")
    ResponseEntity<ApiResponse<List<SimilarToursResponse>>> getFilterToursByArea(
            @RequestParam String id,
            @RequestParam String destination,
            @RequestParam Integer day) {

        ApiResponse<List<SimilarToursResponse>> apiResponse = ApiResponse.<List<SimilarToursResponse>>builder()
                .code(1512)
                .result(tourService.getSimilarTours(id, destination, day))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/list/summary")
    ResponseEntity<ApiResponse<List<ListToursResponse>>> getListTours() {
        ApiResponse<List<ListToursResponse>> apiResponse = ApiResponse.<List<ListToursResponse>>builder()
                .code(1513)
                .result(tourService.getListTours())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/not-started/{id}")
    ResponseEntity<ApiResponse<TourResponse>> checkNotStartedById(@PathVariable String id) {
        if (scheduleService.existsScheduleByTourIdAndStatus(id, CommonStatus.NOT_STARTED.getValue())) {
            throw new AppException(ErrorCode.TOUR_NOT_STARTED);
        }

        ApiResponse<TourResponse> apiResponse = ApiResponse.<TourResponse>builder()
                .code(1514)
                .message("Không tồn tại lịch trình.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/hot")
    ResponseEntity<ApiResponse<List<FilterToursResponse>>> getHotTours() {

        ApiResponse<List<FilterToursResponse>> apiResponse = ApiResponse.<List<FilterToursResponse>>builder()
                .code(1515)
                .result(tourService.getHotTours())
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}