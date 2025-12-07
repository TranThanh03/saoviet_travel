package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.PromotionCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.PromotionUpdateRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.PromotionListResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.PromotionResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.PromotionSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.service.AuthenticationService;
import com.websitesaoviet.WebsiteSaoViet.service.PromotionService;
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
@RequestMapping("/promotions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PromotionController {
    PromotionService promotionService;
    AuthenticationService authenticationService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping()
    ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(@RequestBody @Valid PromotionCreationRequest request) {
        ApiResponse<PromotionResponse> apiResponse = ApiResponse.<PromotionResponse>builder()
                .code(1700)
                .message("Thêm khuyến mãi mới thành công.")
                .result(promotionService.createPromotion(request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    ResponseEntity<ApiResponse<Page<PromotionListResponse>>> getPromotions(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        ApiResponse<Page<PromotionListResponse>> apiResponse = ApiResponse.<Page<PromotionListResponse>>builder()
                .code(1701)
                .result(promotionService.getPromotions(keyword, pageable))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/list")
    ResponseEntity<ApiResponse<List<PromotionSummaryResponse>>> getPromotionList(@RequestHeader("Authorization") String authHeader) {
        String accessToken = authHeader.substring(7);
        String customerId = authenticationService.getIdByToken(accessToken);

        ApiResponse<List<PromotionSummaryResponse>> apiResponse = ApiResponse.<List<PromotionSummaryResponse>>builder()
                .code(1702)
                .result(promotionService.getPromotionList(customerId))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<PromotionResponse>> getPromotionById(@PathVariable String id) {
        ApiResponse<PromotionResponse> apiResponse = ApiResponse.<PromotionResponse>builder()
                .code(1703)
                .result(promotionService.getPromotionByIdAndAdmin(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(
            @PathVariable String id,
            @RequestBody @Valid PromotionUpdateRequest request
    ) {
        ApiResponse<PromotionResponse> apiResponse = ApiResponse.<PromotionResponse>builder()
                .code(1704)
                .message("Cập nhật thông tin khuyến mãi thành công.")
                .result(promotionService.updatePromotion(id, request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<String>> deletePromotion(@PathVariable String id) {
        promotionService.deletePromotion(id);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1705)
                .message("Xóa khuyến mãi thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}