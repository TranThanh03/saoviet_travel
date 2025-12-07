package com.websitesaoviet.WebsiteSaoViet.dto.request.common;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChangePasswordRequest {
    @NotBlank(message = "NOT_NULL")
    String currentPassword;

    @NotBlank(message = "NOT_NULL")
    @Size(min = 8, message = "PASSWORD_INVALID")
    String newPassword;
}