package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.AdminUpdateRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.ChangePasswordRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.EmailRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.ResetPasswordRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.VerifyForgotPasswordRequest;
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

import java.security.SecureRandom;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminService {
    AdminRepository adminRepository;
    AdminMapper adminMapper;
    RedisService redisService;
    MailService mailService;

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

    public void changePassword(String id, ChangePasswordRequest request) {
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

    public void generateForgotPasswordOtp(EmailRequest request) {
        try {
            String email = request.getEmail().trim();
            var adminId = this.getAdminIdByEmail(email);
            Integer otp = this.generateOtp();

            redisService.setForgotPasswordOtp(adminId, otp);
            mailService.sendForgotPasswordEmail(email, otp, 300L);
        } catch (AppException ae) {
            throw new AppException(ae.getErrorCode());
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    public void resendForgotPasswordOtp(EmailRequest request) {
        try {
            String email = request.getEmail().trim();
            var adminId = this.getAdminIdByEmail(email);
            Integer otp = redisService.getForgotPasswordOtp(adminId);
            Long ttl = 300L;

            if (otp == null) {
                otp = generateOtp();
                redisService.setForgotPasswordOtp(adminId, otp);
            } else {
                ttl = redisService.getForgotPasswordOtpTtl(adminId);
            }

            mailService.sendForgotPasswordEmail(email, otp, ttl);
        } catch (AppException ae) {
            throw new AppException(ae.getErrorCode());
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    public String verifyForgotPasswordOtp(VerifyForgotPasswordRequest request) {
        try {
            var adminId = this.getAdminIdByEmail(request.getEmail().trim());
            Integer otp = redisService.getForgotPasswordOtp(adminId);

            if (otp != null && request.getOtp() != null && otp.equals(request.getOtp())) {
                String resetToken = UUID.randomUUID().toString();

                redisService.setResetPasswordToken(adminId, resetToken);
                redisService.removeForgotPasswordOtp(adminId);

                return resetToken;
            } else {
                throw new AppException(ErrorCode.OTP_INVALID);
            }
        } catch (AppException ae) {
            throw new AppException(ae.getErrorCode());
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    public String resetPassword(ResetPasswordRequest request) {
        try {
            var adminId = this.getAdminIdByEmail(request.getEmail().trim());
            String clientToken = request.getResetToken().trim();
            String resetToken = redisService.getResetPasswordToken(adminId);

            if (clientToken != null && resetToken != null && resetToken.equals(clientToken)) {
                this.updatePassword(adminId, request.getNewPassword().trim());
                redisService.removeResetPasswordToken(adminId);

                return adminId;
            } else {
                throw new AppException(ErrorCode.RESET_TOKEN_INVALID);
            }
        } catch (AppException ae) {
            throw new AppException(ae.getErrorCode());
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    private String getAdminIdByEmail(String email) {
        return adminRepository.findAdminIdByEmail(email).
                orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXITED));
    }

    private void updatePassword(String id, String newPassword) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        int rowsUpdated = adminRepository.updatePassword(id, passwordEncoder.encode(newPassword));

        if (rowsUpdated == 0) {
            throw new AppException(ErrorCode.UPDATE_PASSWORD_FAILED);
        }
    }

    private int generateOtp() {
        SecureRandom random = new SecureRandom();
        return 100000 + random.nextInt(900000);
    }
}