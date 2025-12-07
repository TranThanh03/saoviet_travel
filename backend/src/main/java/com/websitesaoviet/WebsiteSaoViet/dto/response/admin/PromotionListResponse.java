package com.websitesaoviet.WebsiteSaoViet.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionListResponse {
    String id;
    String code;
    String title;
    Double discount;
    LocalDate startDate;
    LocalDate endDate;
    int quantity;
    String status;
}