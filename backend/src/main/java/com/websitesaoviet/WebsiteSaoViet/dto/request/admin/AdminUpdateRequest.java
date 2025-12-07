package com.websitesaoviet.WebsiteSaoViet.dto.request.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUpdateRequest {
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
}