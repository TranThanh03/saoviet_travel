package com.websitesaoviet.WebsiteSaoViet.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingCheckoutDetailResponse {
    String id;
    String code;
    String fullName;
    String phone;
    String email;
    String tourName;
    LocalDate startDate;
    LocalDate endDate;
    int quantityAdult;
    int quantityChildren;
    Double adultPrice;
    Double childrenPrice;
    Double discount;
    Double totalPrice;
    LocalDateTime bookingTime;
    LocalDateTime expiredTime;
    String status;
    boolean isReserved;
    String checkoutId;
    String checkoutCode;
    String method;
    LocalDateTime checkoutTime;
    String checkoutStatus;
}