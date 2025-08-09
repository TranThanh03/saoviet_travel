package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.user.CheckoutProcessionRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.UrlCheckoutResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.*;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/checkouts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutController {
    CheckoutService checkoutService;
    ScheduleService scheduleService;
    AuthenticationService authenticationService;
    PromotionService promotionService;

    @PostMapping("/process")
    ResponseEntity<ApiResponse<UrlCheckoutResponse>> processCheckout(@CookieValue("token") String token,
                                                                     @Valid @RequestBody CheckoutProcessionRequest request) {

        if (request.getQuantityAdult() + request.getQuantityChildren() <= 0) {
            throw new AppException(ErrorCode.QUANTITY_PEOPLE_INVALID);
        }

        var schedule = scheduleService.getScheduleById(request.getScheduleId());

        int quantityPeople = request.getQuantityAdult() + request.getQuantityChildren();
        if (!scheduleService.existsScheduleByQuantityPeople(request.getScheduleId(), quantityPeople)) {
            throw new AppException(ErrorCode.SCHEDULE_PEOPLE_INVALID);
        }

        Double adultPrice = schedule.getAdultPrice();
        Double childrenPrice = schedule.getChildrenPrice();
        Double discount = 0.0;

        if ((request.getMethod().equals("momo") || request.getMethod().equals("vnpay")) && (!request.getPromotionId().trim().equals(""))) {
            try {
                var promotion = promotionService.getAvailablePromotionById(request.getPromotionId());
                discount = promotion.getDiscount();
            } catch (Exception e) {
                throw new AppException(ErrorCode.PROMOTION_NOT_EXITED);
            }
        }

        Double amount = adultPrice * request.getQuantityAdult() + childrenPrice * request.getQuantityChildren() - discount;

        String checkoutUrl = "";
        Random random = new Random();
        String orderId = System.currentTimeMillis() + "" + random.nextInt(1000);
        int responseCode;
        String customerId = authenticationService.getIdByToken(token);

        switch (request.getMethod()) {
            case "momo":
                responseCode = 1901;
                checkoutUrl = checkoutService.processMomoCheckout(orderId, customerId, amount, request);
                break;
            case "vnpay":
                responseCode = 1902;
                checkoutUrl = checkoutService.processVnpayCheckout(orderId, customerId, amount, request);
                break;
            case "cash":
                responseCode = 1903;
                checkoutUrl =  checkoutService.resultCashCheckout(orderId, customerId, amount, request);
                break;
            default:
                responseCode = 1900;
                break;
        }

        ApiResponse<UrlCheckoutResponse> apiResponse = ApiResponse.<UrlCheckoutResponse>builder()
                .code(responseCode)
                .result(
                        UrlCheckoutResponse.builder()
                                .checkoutUrl(checkoutUrl)
                                .build()
                )
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/momo/callback")
    ResponseEntity<ApiResponse<String>> handleMomoCallback(@RequestParam Map<String, String> allParams) {
        boolean result = checkoutService.resultMomoCheckout(allParams);
        int code;
        String message;

        if (result) {
            code = 1904;
            message = "Thanh toán Momo thành công.";
        } else {
            code = 1905;
            message = "Thanh toán Momo thất bại!";
        }

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(code)
                .message(message)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/vnpay/callback")
     ResponseEntity<ApiResponse<String>> handleVnpayCallback(@RequestParam Map<String, String> allParams) {
        boolean result = checkoutService.resultVnpayCheckout(allParams);
        int code;
        String message;

        if (result) {
            code = 1906;
            message = "Thanh toán Vnpay thành công.";
        } else {
            code = 1907;
            message = "Thanh toán Vnpay thất bại!";
        }

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(code)
                .message(message)
                .build();

        return ResponseEntity.ok(apiResponse);
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