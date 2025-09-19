package com.websitesaoviet.WebsiteSaoViet.dto.request.common;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordChangeRequest {
    @NotNull(message = "NOT_NULL")
    String currentPassword;

    @Size(min = 8, message = "PASSWORD_INVALID")
    String newPassword;
}