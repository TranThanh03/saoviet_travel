package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.user.RetryPaymentRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.UrlCheckoutResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.*;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentResultController {
    PaymentResultService paymentResultService;
    AuthenticationService authenticationService;

    @PostMapping("/momo/callback")
    ResponseEntity<ApiResponse<String>> handleMomoCallback(@RequestBody Map<String, String> allParams) {
        paymentResultService.resultMomoPayment(allParams);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(2300)
                .message("Thanh toán bằng Momo thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/vnpay/callback")
    ResponseEntity<ApiResponse<String>> handleVnpayCallback(@RequestParam Map<String, String> allParams) {
        paymentResultService.resultVnpayPayment(allParams);


        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(2301)
                .message("Thanh toán bằng Vnpay thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{code}/validate")
    ResponseEntity<ApiResponse<String>> validatePayment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String code
    ) {
        String accessToken = authHeader.substring(7);
        String customerId = authenticationService.getIdByToken(accessToken);

        paymentResultService.validatePayment(code, customerId);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(2302)
                .message("Lịch đặt đã thanh toán.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/confirm")
    ResponseEntity<ApiResponse<String>> confirmPayment(
            @PathVariable String id,
            @RequestParam(required = false) String code
    ) {
        paymentResultService.confirmPayment(id, code.trim());

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(2303)
                .message("Xác nhận thanh toán thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/retry")
    CompletableFuture<ResponseEntity<ApiResponse<UrlCheckoutResponse>>> retryPayment(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody RetryPaymentRequest request
    ) {
        String accessToken = authHeader.substring(7);

        return paymentResultService.retryPayment(accessToken, request)
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
                    log.error("Retry payment failed: ", ex);

                    ApiResponse<UrlCheckoutResponse> errorResponse = ApiResponse.<UrlCheckoutResponse>builder()
                            .code(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                            .message(ErrorCode.INTERNAL_SERVER_ERROR.getMessage())
                            .build();

                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                });
    }
}
