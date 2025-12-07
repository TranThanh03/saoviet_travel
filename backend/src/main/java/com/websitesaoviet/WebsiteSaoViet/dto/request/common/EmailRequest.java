package com.websitesaoviet.WebsiteSaoViet.dto.request.common;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailRequest {
    @NotBlank(message = "NOT_NULL")
    @Email(message = "EMAIL_INVALID")
    String email;
}