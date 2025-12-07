package com.websitesaoviet.WebsiteSaoViet.dto.response.user;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingCheckoutResponse {
    String code;
    String customerId;
    String promotionId;
    String scheduleId;
    int quantityAdult;
    int quantityChildren;
    Double totalPrice;
    boolean isReserved;
}