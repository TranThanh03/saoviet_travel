package com.websitesaoviet.WebsiteSaoViet.controller;

import com.nimbusds.jose.JOSEException;
import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.AdminUpdateRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.*;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.AdminResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.AccessTokenResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.AuthenticationService;
import com.websitesaoviet.WebsiteSaoViet.service.AdminService;
import com.websitesaoviet.WebsiteSaoViet.service.RecaptchaService;
import com.websitesaoviet.WebsiteSaoViet.util.DomainUtil;
import io.micrometer.common.util.StringUtils;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.time.Duration;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminController {
    AdminService adminService;
    AuthenticationService authenticationService;
    RecaptchaService recaptchaService;

    @NonFinal
    @Value("${app.fe-base-url}")
    protected String FE_BASE_URL;

    @PostMapping("/auth/login")
    ResponseEntity<ApiResponse<AccessTokenResponse>> authenticate(
            @RequestBody @Valid AuthenticationRequest request,
            HttpServletResponse response
    ) {
        if (!recaptchaService.verifyCB(request.getRecaptcha())) {
            throw new AppException(ErrorCode.RECAPTCHA_FAILED);
        }

        var result = authenticationService.authenticateAdmin(request);
        String refreshToken = authenticationService.generateRefreshToken(result.getUserId());

        ResponseCookie cookie = ResponseCookie.from("refresh-token-admin", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(DomainUtil.extractDomain(FE_BASE_URL))
                .path("/")
                .maxAge(10 * 24 * 3600)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        ApiResponse<AccessTokenResponse> apiResponse = ApiResponse.<AccessTokenResponse>builder()
                .code(1200)
                .message("Đăng nhập thành công.")
                .result(
                        AccessTokenResponse.builder()
                                .accessToken(result.getAccessToken())
                                .build()
                )
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/auth/logout")
    ResponseEntity<ApiResponse<String>> logout(
            @CookieValue(value = "refresh-token-admin", required = false) String refreshTokenAdmin,
            @RequestHeader("Authorization") String authHeader,
            HttpServletResponse response
    ) throws ParseException, JOSEException {
        if (StringUtils.isBlank(refreshTokenAdmin)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_NOT_EXITED);
        }

        String accessToken = authHeader.substring(7);

        authenticationService.deleteRefreshToken(refreshTokenAdmin);
        authenticationService.logout(accessToken);

        ResponseCookie cookie = ResponseCookie.from("refresh-token-admin", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(DomainUtil.extractDomain(FE_BASE_URL))
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1201)
                .message("Đăng xuất thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/auth/token/refresh")
    ResponseEntity<ApiResponse<AccessTokenResponse>> refreshAccessToken(@CookieValue(value = "refresh-token-admin", required = false) String refreshToken) {
        if (StringUtils.isBlank(refreshToken)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_NOT_EXITED);
        }

        ApiResponse<AccessTokenResponse> apiResponse = ApiResponse.<AccessTokenResponse>builder()
                .code(1202)
                .result(
                        AccessTokenResponse.builder()
                                .accessToken(authenticationService.refreshAccessTokenAdmin(refreshToken))
                                .build()
                )
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/info")
    ResponseEntity<ApiResponse<AdminResponse>> getAdminByToken(@RequestHeader("Authorization") String authHeader) {
        String accessToken = authHeader.substring(7);
        String id = authenticationService.getIdByToken(accessToken);

        ApiResponse<AdminResponse> apiResponse = ApiResponse.<AdminResponse>builder()
                .code(1203)
                .result(adminService.getAdminById(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("")
    ResponseEntity<ApiResponse<AdminResponse>> updateAdmin(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody @Valid AdminUpdateRequest request
    ) {
        String accessToken = authHeader.substring(7);
        String id = authenticationService.getIdByToken(accessToken);

        ApiResponse<AdminResponse> apiResponse = ApiResponse.<AdminResponse>builder()
                .code(1204)
                .message("Cập nhật thông tin quản trị viên thành công.")
                .result(adminService.updateAdmin(id, request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/change-password")
    ResponseEntity<ApiResponse<String>> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody @Valid ChangePasswordRequest request,
            HttpServletResponse response
    ) {
        String accessToken = authHeader.substring(7);
        String id = authenticationService.getIdByToken(accessToken);

        adminService.changePassword(id, request);
        authenticationService.deleteRefreshTokenByUserId(id);

        String refreshToken = authenticationService.generateRefreshToken(id);

        ResponseCookie cookie = ResponseCookie.from("refresh-token-admin", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(DomainUtil.extractDomain(FE_BASE_URL))
                .path("/")
                .maxAge(10 * 24 * 3600)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1205)
                .message("Thay đổi mật khẩu thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/auth/forgot-password")
    ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody EmailRequest request) {
        adminService.generateForgotPasswordOtp(request);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1206)
                .message("Gửi mã OTP qua mail thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/auth/forgot-password/resend")
    ResponseEntity<ApiResponse<String>> resendForgotPasswordOtp(@Valid @RequestBody EmailRequest request) {
        adminService.resendForgotPasswordOtp(request);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1207)
                .message("Gửi lại mã OTP qua mail thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/auth/forgot-password/verify")
    ResponseEntity<ApiResponse<String>> verifyForgotPasswordOtp(@Valid @RequestBody VerifyForgotPasswordRequest request) {
        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1208)
                .result(adminService.verifyForgotPasswordOtp(request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/auth/forgot-password/reset")
    ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String adminId = adminService.resetPassword(request);
        authenticationService.deleteRefreshTokenByUserId(adminId);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1209)
                .message("Thay đổi mật khẩu thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}