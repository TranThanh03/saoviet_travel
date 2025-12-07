package com.websitesaoviet.WebsiteSaoViet.dto.request.common;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationRequest {
    @NotBlank(message = "NOT_NULL")
    String username;

    @NotBlank(message = "NOT_NULL")
    String password;

    @NotBlank(message = "NOT_NULL")
    String recaptcha;
}
