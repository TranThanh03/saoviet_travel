package com.websitesaoviet.WebsiteSaoViet.dto.response.user;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingDetailResponse {
    String id;
    String code;
    String customerId;
    String tourId;
    String tourCode;
    String tourName;
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
    String status;
    boolean isReviewed;
    String checkoutCode;
    String method;
    LocalDateTime checkoutTime;
    String checkoutStatus;
}