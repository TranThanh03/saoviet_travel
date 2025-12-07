package com.websitesaoviet.WebsiteSaoViet.dto.request.user;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerCreationRequest {
    @NotBlank(message = "NOT_NULL")
    @Size(min = 5, max = 50, message = "FULLNAME_LENGTH_INVALID")
    @Pattern(regexp = "^[\\p{L} ]+$", message = "FULLNAME_INVALID")
    String fullName;

    @NotBlank(message = "NOT_NULL")
    @Pattern(regexp = "\\d{10}", message = "PHONENUMBER_INVALID")
    String phone;

    @NotBlank(message = "NOT_NULL")
    @Email(message = "EMAIL_INVALID")
    String email;

    @NotBlank(message = "NOT_NULL")
    @Size(min = 8, message = "PASSWORD_INVALID")
    String password;

    @NotBlank(message = "NOT_NULL")
    String recaptcha;
}