package com.websitesaoviet.WebsiteSaoViet.controller;

import com.nimbusds.jose.JOSEException;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.*;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.AccessTokenResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.IntrospectResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.AuthenticationService;
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
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.time.Duration;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;
    RecaptchaService recaptchaService;

    @NonFinal
    @Value("${app.fe-base-url}")
    protected String FE_BASE_URL;

    @PostMapping("/login")
    ResponseEntity<ApiResponse<AccessTokenResponse>> authenticate(
            @RequestBody @Valid AuthenticationRequest request,
            HttpServletResponse response
    ) {
        if (!recaptchaService.verifyCB(request.getRecaptcha())) {
            throw new AppException(ErrorCode.RECAPTCHA_FAILED);
        }

        var result = authenticationService.authenticate(request);
        String refreshToken = authenticationService.generateRefreshToken(result.getUserId());

        ResponseCookie cookie = ResponseCookie.from("refresh-token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(DomainUtil.extractDomain(FE_BASE_URL))
                .path("/")
                .maxAge(10 * 24 * 3600)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        ApiResponse<AccessTokenResponse> apiResponse = ApiResponse.<AccessTokenResponse>builder()
                .code(1900)
                .message("Đăng nhập thành công.")
                .result(
                        AccessTokenResponse.builder()
                                .accessToken(result.getAccessToken())
                                .build()
                )
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/introspect")
    ResponseEntity<ApiResponse<IntrospectResponse>> introspectToken(@Valid @RequestBody IntrospectRequest request) {
        var result = authenticationService.introspect(
                IntrospectRequest.builder()
                        .accessToken(request.getAccessToken())
                        .build()
        );

        ApiResponse<IntrospectResponse> apiResponse = ApiResponse.<IntrospectResponse>builder()
                .code(1901)
                .result(result)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/logout")
    ResponseEntity<ApiResponse<String>> logout(
            @CookieValue(value = "refresh-token", required = false) String refreshToken,
            @RequestHeader("Authorization") String authHeader,
            HttpServletResponse response
    ) throws ParseException, JOSEException {
        if (StringUtils.isBlank(refreshToken)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_NOT_EXITED);
        }

        String accessToken = authHeader.substring(7);

        authenticationService.deleteRefreshToken(refreshToken);
        authenticationService.logout(accessToken);

        ResponseCookie cookie = ResponseCookie.from("refresh-token", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(DomainUtil.extractDomain(FE_BASE_URL))
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1902)
                .message("Đăng xuất thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/token/refresh")
    ResponseEntity<ApiResponse<AccessTokenResponse>> refreshAccessToken(@CookieValue(value = "refresh-token", required = false) String refreshToken) {
        if (StringUtils.isBlank(refreshToken)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_NOT_EXITED);
        }

        ApiResponse<AccessTokenResponse> apiResponse = ApiResponse.<AccessTokenResponse>builder()
                .code(1903)
                .result(
                        AccessTokenResponse.builder()
                                .accessToken(authenticationService.refreshAccessToken(refreshToken))
                                .build()
                )
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/forgot-password")
    ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody EmailRequest request) {
        authenticationService.generateForgotPasswordOtp(request);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1904)
                .message("Gửi mã OTP qua mail thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/forgot-password/resend")
    ResponseEntity<ApiResponse<String>> resendForgotPasswordOtp(@Valid @RequestBody EmailRequest request) {
        authenticationService.resendForgotPasswordOtp(request);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1905)
                .message("Gửi lại mã OTP qua mail thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/forgot-password/verify")
    ResponseEntity<ApiResponse<String>> verifyForgotPasswordOtp(@Valid @RequestBody VerifyForgotPasswordRequest request) {
        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1906)
                .result(authenticationService.verifyForgotPasswordOtp(request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/forgot-password/reset")
    ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authenticationService.resetPassword(request);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1907)
                .message("Thay đổi mật khẩu thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
