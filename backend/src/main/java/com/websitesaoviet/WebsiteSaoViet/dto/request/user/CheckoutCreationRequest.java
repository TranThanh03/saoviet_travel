package com.websitesaoviet.WebsiteSaoViet.dto.request.user;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckoutCreationRequest {
    String code;
    String bookingId;
    String orderId;
    String method;
    LocalDateTime checkoutTime;
    String status;
}
