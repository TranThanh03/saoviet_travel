package com.websitesaoviet.WebsiteSaoViet.dto.response.common;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    String id;
    String code;
    String customerId;
    String customerCode;
    String tourId;
    String tourCode;
    String tourName;
    String scheduleId;
    String scheduleCode;
    LocalDate startDate;
    LocalDate endDate;
    int quantityDay;
    int quantityAdult;
    int quantityChildren;
    Double adultPrice;
    Double childrenPrice;
    Double discount;
    Double totalPrice;
    LocalDateTime bookingTime;
    LocalDateTime expiredTime;
    String status;
}