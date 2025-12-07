package com.websitesaoviet.WebsiteSaoViet.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RetryPaymentRequest {
    @NotBlank(message = "NOT_NULL")
    String bookingId;

    @NotBlank(message = "NOT_NULL")
    String method;
}