package com.websitesaoviet.WebsiteSaoViet.dto.response.user;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleSummaryResponse {
    String id;
    LocalDate startDate;
    LocalDate endDate;
    Double adultPrice;
    Double childrenPrice;
    int quantityPeople;
}