package com.websitesaoviet.WebsiteSaoViet.dto.request.user;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingCreationRequest {
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
    String promotionId;
    Double discount;
    Double totalPrice;
    LocalDateTime expiredTime;
}