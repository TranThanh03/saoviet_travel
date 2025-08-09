package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.AdminUpdateRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.PasswordChangeRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.AdminResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.service.AuthenticationService;
import com.websitesaoviet.WebsiteSaoViet.service.AdminService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class AdminController {
    AdminService adminService;
    AuthenticationService authenticationService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/infor")
    ResponseEntity<ApiResponse<AdminResponse>> getAdminByToken(@CookieValue("token-admin") String token) {
        String id = authenticationService.getIdByToken(token);

        ApiResponse<AdminResponse> apiResponse = ApiResponse.<AdminResponse>builder()
                .code(1200)
                .result(adminService.getAdminById(id))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("")
    ResponseEntity<ApiResponse<AdminResponse>> updateAdmin(@CookieValue("token-admin") String token,
                                                            @RequestBody @Valid AdminUpdateRequest request) {

        String id = authenticationService.getIdByToken(token);

        ApiResponse<AdminResponse> apiResponse = ApiResponse.<AdminResponse>builder()
                .code(1201)
                .message("Cập nhật thông tin quản trị viên thành công.")
                .result(adminService.updateAdmin(id, request))
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/password")
    ResponseEntity<ApiResponse<String>> changePassword(@CookieValue("token-admin") String token,
                                                            @RequestBody @Valid PasswordChangeRequest request) {

        String id = authenticationService.getIdByToken(token);

        adminService.changePassword(id, request);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(1202)
                .message("Thay đổi mật khẩu thành công.")
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}