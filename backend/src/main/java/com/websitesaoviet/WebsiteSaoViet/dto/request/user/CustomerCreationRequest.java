package com.websitesaoviet.WebsiteSaoViet.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerCreationRequest {
    @Size(min = 5, max = 50, message = "FULLNAME_LENGTH_INVALID")
    @Pattern(regexp = "^[\\p{L} ]+$", message = "FULLNAME_INVALID")
    String fullName;

    @Pattern(regexp = "\\d{10}", message = "PHONENUMBER_INVALID")
    String phone;

    @Email(message = "EMAIL_INVALID")
    String email;

    @Size(min = 8, message = "PASSWORD_INVALID")
    String password;

    @NotNull(message = "NOT_NULL")
    String recaptcha;
}