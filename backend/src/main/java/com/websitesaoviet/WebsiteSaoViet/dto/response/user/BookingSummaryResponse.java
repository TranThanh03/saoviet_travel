package com.websitesaoviet.WebsiteSaoViet.dto.response.user;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingSummaryResponse {
    String id;
    String code;
    String tourId;
    String tourName;
    String image;
    String destination;
    int quantityDay;
    int people;
    Double totalPrice;
    int rating;
    LocalDateTime bookingTime;
    LocalDateTime expiredTime;
    String status;
    boolean isReviewed;
    String method;
}