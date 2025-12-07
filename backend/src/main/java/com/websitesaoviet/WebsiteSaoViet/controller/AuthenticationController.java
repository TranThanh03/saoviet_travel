package com.websitesaoviet.WebsiteSaoViet.controller;

import com.nimbusds.jose.JOSEException;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.AuthenticationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.IntrospectRequest;
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
    @Value("${base.url}")
    protected String BASE_URL;

    @PostMapping("/login")
    public ApiResponse<AccessTokenResponse> authenticate(
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
                .domain(DomainUtil.extractDomain(BASE_URL))
                .path("/")
                .maxAge(10 * 24 * 3600)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.<AccessTokenResponse>builder()
                .code(9999)
                .message("Đăng nhập thành công.")
                .result(
                        AccessTokenResponse.builder()
                                .accessToken(result.getAccessToken())
                                .build()
                )
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspectToken(@Valid @RequestBody IntrospectRequest request) {
        var result = authenticationService.introspect(
                IntrospectRequest.builder()
                        .accessToken(request.getAccessToken())
                        .build()
        );

        return ApiResponse.<IntrospectResponse>builder()
                .code(result.isValid() ? 9998 : 4448)
                .result(result)
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<String> logout(
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
                .domain(DomainUtil.extractDomain(BASE_URL))
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.<String>builder()
                .code(9997)
                .message("Đăng xuất thành công.")
                .build();
    }

    @PostMapping("/admin/login")
    public ApiResponse<AccessTokenResponse> authenticateAdmin(
            @RequestBody @Valid AuthenticationRequest request,
            HttpServletResponse response
    ) {
        if (!recaptchaService.verifyCB(request.getRecaptcha())) {
            throw new AppException(ErrorCode.RECAPTCHA_FAILED);
        }

        var result = authenticationService.authenticateAdmin(request);
        String refreshTokenAdmin = authenticationService.generateRefreshToken(result.getUserId());

        ResponseCookie cookie = ResponseCookie.from("refresh-token-admin", refreshTokenAdmin)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(DomainUtil.extractDomain(BASE_URL))
                .path("/")
                .maxAge(10 * 24 * 3600)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.<AccessTokenResponse>builder()
                .code(9996)
                .message("Đăng nhập thành công.")
                .result(
                        AccessTokenResponse.builder()
                                .accessToken(result.getAccessToken())
                                .build()
                )
                .build();
    }

    @PostMapping("/admin/logout")
    ApiResponse<String> logoutAdmin(
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
                .domain(DomainUtil.extractDomain(BASE_URL))
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.<String>builder()
                .code(9995)
                .message("Đăng xuất thành công.")
                .build();
    }

    @PostMapping("/token/refresh")
    ApiResponse<AccessTokenResponse> refreshAccessToken(@CookieValue(value = "refresh-token", required = false) String refreshToken) {
        if (StringUtils.isBlank(refreshToken)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_NOT_EXITED);
        }

        return ApiResponse.<AccessTokenResponse>builder()
                .code(9994)
                .result(
                        AccessTokenResponse.builder()
                                .accessToken(authenticationService.refreshAccessToken(refreshToken))
                                .build()
                )
                .build();
    }

    @PostMapping("/admin/token/refresh")
    ApiResponse<AccessTokenResponse> refreshAccessTokenAdmin(@CookieValue(value = "refresh-token-admin", required = false) String refreshToken) {
        if (StringUtils.isBlank(refreshToken)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_NOT_EXITED);
        }

        return ApiResponse.<AccessTokenResponse>builder()
                .code(9993)
                .result(
                        AccessTokenResponse.builder()
                                .accessToken(authenticationService.refreshAccessTokenAdmin(refreshToken))
                                .build()
                )
                .build();
    }
}
