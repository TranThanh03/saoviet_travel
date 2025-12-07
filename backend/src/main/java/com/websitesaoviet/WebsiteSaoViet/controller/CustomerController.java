package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.common.ChangePasswordRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.CustomerCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.CustomerUpdateRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.CustomerResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.CustomerCreateResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.*;
import com.websitesaoviet.WebsiteSaoViet.util.DomainUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerController {
    CustomerService customerService;
    AuthenticationService authenticationService;
    BookingService bookingService;
    RecaptchaService recaptchaService;
    MailService mailService;

    @NonFinal
    @Value("${app.fe-base-url}")
    protected String FE_BASE_URL;

    @PostMapping()
    ResponseEntity<ApiResponse<CustomerCreateResponse>> createCustomer(@RequestBody @Valid CustomerCreationRequest request) {
        if (!recaptchaService.verifyINV(request.getRecaptcha())) {
            throw new AppException(ErrorCode.RECAPTCHA_FAILED);
        }

        var customer = customerService.createCustomer(request);
        mailService.sendActivationEmail(customer.getId(), customer.getEmail());

        ApiResponse<CustomerCreateResponse> apiResponse = ApiResponse.<CustomerCreateResponse>builder()
                .code(1300)
                .message("Tạo khách hàng mới thành công.")
                .result(CustomerCreateResponse.builder()
                        .code(customer.getCode())
                        .fullName(customer.getFullName())
                        .phone(customer.getPhone())
                        .email(customer.getEmail())
                        .build())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    ResponseEntity<ApiResponse<Page<CustomerResponse>>> getCustomers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        ApiResponse<Page<CustomerResponse>> apiResponse = ApiResponse.<Page<CustomerResponse>>builder()
                .code(1301)
                .result(customerService.getCustomers(keyword, pageable))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable String id) {
        ApiResponse<CustomerResponse> apiResponse = ApiResponse.<CustomerResponse>builder()
                .code(1302)
                .result(customerService.getCustomerById(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/info")
    ResponseEntity<ApiResponse<CustomerResponse>> getCustomerByToken(@RequestHeader("Authorization") String authHeader) {
        String accessToken = authHeader.substring(7);
        String id = authenticationService.getIdByToken(accessToken);

        ApiResponse<CustomerResponse> apiResponse = ApiResponse.<CustomerResponse>builder()
                .code(1303)
                .result(customerService.getCustomerById(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("")
    ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody @Valid CustomerUpdateRequest request
    ) {
        String accessToken = authHeader.substring(7);
        String id = authenticationService.getIdByToken(accessToken);

        ApiResponse<CustomerResponse> apiResponse = ApiResponse.<CustomerResponse>builder()
                .code(1304)
                .message("Cập nhật thông tin khách hàng thành công.")
                .result(customerService.updateCustomer(id, request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable String id) {
        if (bookingService.existsByCustomerId(id)) {
            throw new AppException(ErrorCode.BOOKING_PROCESSING);
        }

        customerService.deleteCustomer(id);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1305)
                .message("Xóa khách hàng thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/change-password")
    ResponseEntity<ApiResponse<String>> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody @Valid ChangePasswordRequest request,
            HttpServletResponse response
    ) {
        String accessToken = authHeader.substring(7);
        String id = authenticationService.getIdByToken(accessToken);

        customerService.changePassword(id, request);
        authenticationService.deleteRefreshTokenByUserId(id);

        String refreshToken = authenticationService.generateRefreshToken(id);

        ResponseCookie cookie = ResponseCookie.from("refresh-token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(DomainUtil.extractDomain(FE_BASE_URL))
                .path("/")
                .maxAge(10 * 24 * 3600)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1306)
                .message("Thay đổi mật khẩu thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/{id}/activate")
    ResponseEntity<ApiResponse<String>> activateCustomer(@PathVariable String id) {
        customerService.activateCustomer(id);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1307)
                .message("Kích hoạt thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/lock")
    ResponseEntity<ApiResponse<String>> blockCustomer(@PathVariable String id) {
        customerService.blockCustomer(id);
        authenticationService.deleteRefreshTokenByUserId(id);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1308)
                .message("Khóa tài khoản thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/unlock")
    ResponseEntity<ApiResponse<String>> unblockCustomer(@PathVariable String id) {
        customerService.unblockCustomer(id);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1309)
                .message("Mở khóa tài khoản thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}