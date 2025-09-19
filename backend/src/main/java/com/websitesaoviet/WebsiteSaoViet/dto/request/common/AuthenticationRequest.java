package com.websitesaoviet.WebsiteSaoViet.dto.request.common;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationRequest {
    @NotNull(message = "NOT_NULL")
    String username;

    @NotNull(message = "NOT_NULL")
    String password;

    @NotNull(message = "NOT_NULL")
    String recaptcha;
}
