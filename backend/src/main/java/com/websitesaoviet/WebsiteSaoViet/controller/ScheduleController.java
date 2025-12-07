package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.ScheduleCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ScheduleListResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ScheduleStartDateResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ScheduleResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ScheduleSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ScheduleTourResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.BookingService;
import com.websitesaoviet.WebsiteSaoViet.service.ScheduleService;
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
@RequestMapping("/schedules")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScheduleController {
    ScheduleService scheduleService;
    BookingService bookingService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping()
    ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(@RequestBody @Valid ScheduleCreationRequest request) {
        ApiResponse<ScheduleResponse> apiResponse = ApiResponse.<ScheduleResponse>builder()
                .code(1600)
                .message("Thêm lịch trình mới thành công.")
                .result(scheduleService.createSchedule(request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    ResponseEntity<ApiResponse<Page<ScheduleListResponse>>> getSchedules(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        ApiResponse<Page<ScheduleListResponse>> apiResponse = ApiResponse.<Page<ScheduleListResponse>>builder()
                .code(1601)
                .result(scheduleService.getSchedules(keyword, pageable))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<ScheduleResponse>> getScheduleById(@PathVariable String id) {
        ApiResponse<ScheduleResponse> apiResponse = ApiResponse.<ScheduleResponse>builder()
                .code(1602)
                .result(scheduleService.getScheduleById(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/tour/{id}")
    public ResponseEntity<ApiResponse<List<ScheduleSummaryResponse>>> getSchedulesByTourId(@PathVariable String id) {
        ApiResponse<List<ScheduleSummaryResponse>> successResponse = ApiResponse.<List<ScheduleSummaryResponse>>builder()
                .code(1603)
                .result(scheduleService.getSchedulesByTourId(id))
                .build();

        return ResponseEntity.ok(successResponse);
    }

    @GetMapping("/schedule-tour/{id}")
    public ResponseEntity<ApiResponse<ScheduleTourResponse>> getScheduleTourById(@PathVariable String id) {
        ApiResponse<ScheduleTourResponse> apiResponse = ApiResponse.<ScheduleTourResponse>builder()
                .code(1604)
                .result(scheduleService.getScheduleTourById(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @PathVariable String id,
            @RequestParam int totalPeople
    ) {
        ApiResponse<ScheduleResponse> apiResponse = ApiResponse.<ScheduleResponse>builder()
                .code(1605)
                .result(scheduleService.updateSchedule(id, totalPeople))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<String>> deleteSchedule(@PathVariable String id) {
        if (bookingService.existsByScheduleId(id)) {
            throw new AppException(ErrorCode.BOOKING_PROCESSING);
        }

        scheduleService.deleteSchedule(id);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1606)
                .message("Xóa lịch trình thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/start-date/{tourId}")
    public ResponseEntity<ApiResponse<List<ScheduleStartDateResponse>>> getStartDateByTourId(@PathVariable String tourId) {
        ApiResponse<List<ScheduleStartDateResponse>> apiResponse = ApiResponse.<List<ScheduleStartDateResponse>>builder()
                .code(1607)
                .result(scheduleService.getStartDateByTourId(tourId))
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}