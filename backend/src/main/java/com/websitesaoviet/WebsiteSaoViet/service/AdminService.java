package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.AdminUpdateRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.PasswordChangeRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.AdminResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Admin;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.mapper.AdminMapper;
import com.websitesaoviet.WebsiteSaoViet.repository.AdminRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminService {
    AdminRepository adminRepository;
    AdminMapper adminMapper;

    public AdminResponse getAdminById(String id) {
        return adminMapper.toAdminResponse(adminRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADMIN_NOT_EXITED)));
    }

    public Admin getAdminDetail(String id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADMIN_NOT_EXITED));
    }

    public AdminResponse updateAdmin(String id, AdminUpdateRequest request) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADMIN_NOT_EXITED));

        if(adminRepository.existsAdminByPhone(request.getPhone()) && !admin.getPhone().equals(request.getPhone())) {
            throw new AppException(ErrorCode.PHONENUMBER_EXISTED);
        }
        else if (adminRepository.existsAdminByEmail(request.getEmail()) && !admin.getEmail().equals(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        adminMapper.updateAdmin(admin, request);

        return adminMapper.toAdminResponse(adminRepository.save(admin));
    }

    public void changePassword(String id, PasswordChangeRequest request) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADMIN_NOT_EXITED));

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminRepository.save(admin);
    }

    public Admin getAdminByPhone(String phone) {
        return adminRepository.findAdminByPhone(phone).
                orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXITED));
    }

    public Admin getAdminByEmail(String email) {
        return adminRepository.findAdminByEmail(email).
                orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXITED));
    }

    public boolean existsAdminById(String id) {
        return adminRepository.existsById(id);
    }
}