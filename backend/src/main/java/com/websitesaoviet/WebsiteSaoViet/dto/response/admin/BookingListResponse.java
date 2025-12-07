package com.websitesaoviet.WebsiteSaoViet.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingListResponse {
    String id;
    String code;
    String customerCode;
    String tourCode;
    String scheduleCode;
    Double totalPrice;
    LocalDateTime bookingTime;
    String paymentStatus;
    String status;
}