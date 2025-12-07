package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.user.CheckoutProcessionRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.UrlCheckoutResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.*;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/checkouts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutController {
    CheckoutService checkoutService;

    @PostMapping("/process")
    CompletableFuture<ResponseEntity<ApiResponse<UrlCheckoutResponse>>> processCheckout(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CheckoutProcessionRequest request
    ) {
        String accessToken = authHeader.substring(7);

        return checkoutService.processCheckout(accessToken, request)
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
                    ApiResponse<UrlCheckoutResponse> errorResponse = ApiResponse.<UrlCheckoutResponse>builder()
                            .code(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                            .message(ErrorCode.INTERNAL_SERVER_ERROR.getMessage())
                            .build();

                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                });
    }

    @PostMapping("/momo/callback")
    CompletableFuture<ResponseEntity<ApiResponse<String>>> handleMomoCallback(@RequestParam Map<String, String> allParams) {
        return checkoutService.resultMomoCheckout(allParams)
                .thenApply(result -> {
                    boolean isSuccess = Boolean.TRUE.equals(result.getResponseResult());
                    int code = isSuccess ? 1904 : 1905;
                    String message = isSuccess ? "Thanh toán Momo thành công." : "Thanh toán Momo thất bại!";

                    if (result.getResponseResult() == null) {
                        code = result.getResponseCode();
                        message = result.getMessage();
                    }

                    ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                            .code(code)
                            .message(message)
                            .build();

                    return ResponseEntity.ok(apiResponse);
                })
                .exceptionally(ex -> {
                    ApiResponse<String> errorResponse = ApiResponse.<String>builder()
                            .code(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                            .message(ErrorCode.INTERNAL_SERVER_ERROR.getMessage())
                            .build();

                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                });
    }

    @PostMapping("/vnpay/callback")
    CompletableFuture<ResponseEntity<ApiResponse<String>>> handleVnpayCallback(@RequestParam Map<String, String> allParams) {
        return checkoutService.resultVnpayCheckout(allParams)
                .thenApply(result -> {
                    boolean isSuccess = Boolean.TRUE.equals(result.getResponseResult());
                    int code = isSuccess ? 1906 : 1907;
                    String message = isSuccess ? "Thanh toán Vnpay thành công." : "Thanh toán Vnpay thất bại!";

                    if (result.getResponseResult() == null) {
                        code = result.getResponseCode();
                        message = result.getMessage();
                    }

                    ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                            .code(code)
                            .message(message)
                            .build();

                    return ResponseEntity.ok(apiResponse);
                })
                .exceptionally(ex -> {
                    ApiResponse<String> errorResponse = ApiResponse.<String>builder()
                            .code(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                            .message(ErrorCode.INTERNAL_SERVER_ERROR.getMessage())
                            .build();

                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                });
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/confirm/{id}")
    ResponseEntity<ApiResponse<String>> updateCheckout(@PathVariable String id) {
        checkoutService.confirmCheckout(id);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1908)
                .message("Xác nhận thanh toán thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
