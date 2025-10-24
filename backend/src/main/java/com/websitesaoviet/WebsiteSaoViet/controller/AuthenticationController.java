package com.websitesaoviet.WebsiteSaoViet.controller;

import com.nimbusds.jose.JOSEException;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.AuthenticationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.IntrospectRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.IntrospectResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.AuthenticationService;
import com.websitesaoviet.WebsiteSaoViet.service.RecaptchaService;
import com.websitesaoviet.WebsiteSaoViet.util.DomainUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ApiResponse<String> authenticate(@RequestBody @Valid AuthenticationRequest request,
                                            HttpServletResponse response) {

        if (!recaptchaService.verifyCB(request.getRecaptcha())) {
            throw new AppException(ErrorCode.RECAPTCHA_FAILED);
        }

        String jwtToken = authenticationService.authenticate(request);

        ResponseCookie cookie = ResponseCookie.from("token", jwtToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(DomainUtil.extractDomain(BASE_URL))
                .path("/")
                .maxAge(60 * 60)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.<String>builder()
                .code(9999)
                .message("Đăng nhập thành công.")
                .build();
    }

    @GetMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspectToken(@CookieValue("token") String token) {
        var result = authenticationService.introspect(
                IntrospectRequest.builder()
                        .token(token)
                        .build());

        return ApiResponse.<IntrospectResponse>builder()
                .code(result.isValid() ? 9998 : 4448)
                .result(result)
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<String> logout(@CookieValue("token") String token,
                               HttpServletResponse response) throws ParseException, JOSEException {

        authenticationService.logout(token);

        ResponseCookie cookie = ResponseCookie.from("token", "")
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
    public ApiResponse<String> authenticateAdmin(@RequestBody @Valid AuthenticationRequest request,
                                                 HttpServletResponse response) {

        if (!recaptchaService.verifyCB(request.getRecaptcha())) {
            throw new AppException(ErrorCode.RECAPTCHA_FAILED);
        }

        String jwtToken = authenticationService.authenticateAdmin(request);

        ResponseCookie cookie = ResponseCookie.from("token-admin", jwtToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(DomainUtil.extractDomain(BASE_URL))
                .path("/")
                .maxAge(60 * 60)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.<String>builder()
                .code(9996)
                .message("Đăng nhập thành công.")
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/introspect")
    public ApiResponse<IntrospectResponse> introspectTokenAdmin(@CookieValue("token-admin") String token) {
        var result = authenticationService.introspect(
                IntrospectRequest.builder()
                        .token(token)
                        .build());

        return ApiResponse.<IntrospectResponse>builder()
                .code(result.isValid() ? 9995 : 4447)
                .result(result)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/logout")
    ApiResponse<String> logoutAdmin(@CookieValue("token-admin") String token,
                                    HttpServletResponse response) throws ParseException, JOSEException {

        authenticationService.logout(token);

        ResponseCookie cookie = ResponseCookie.from("token-admin", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(DomainUtil.extractDomain(BASE_URL))
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.<String>builder()
                .code(9994)
                .message("Đăng xuất thành công.")
                .build();
    }
}
