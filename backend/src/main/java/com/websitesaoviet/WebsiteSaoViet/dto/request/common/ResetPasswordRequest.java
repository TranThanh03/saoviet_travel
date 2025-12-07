package com.websitesaoviet.WebsiteSaoViet.dto.request.common;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResetPasswordRequest {
    @NotBlank(message = "NOT_NULL")
    @Email(message = "EMAIL_INVALID")
    String email;

    @NotBlank(message = "NOT_NULL")
    String resetToken;

    @NotBlank(message = "NOT_NULL")
    @Size(min = 8, message = "PASSWORD_INVALID")
    String newPassword;
}