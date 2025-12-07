package com.websitesaoviet.WebsiteSaoViet.dto.request.common;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VerifyForgotPasswordRequest {
    @NotBlank(message = "NOT_NULL")
    @Email(message = "EMAIL_INVALID")
    String email;

    @NotNull(message = "NOT_NULL")
    @Min(value = 100000, message = "OTP_LENGTH_INVALID")
    @Max(value = 999999, message = "OTP_LENGTH_INVALID")
    Integer otp;
}