package com.websitesaoviet.WebsiteSaoViet.dto.response.user;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleTourResponse {
    String tourCode;
    String tourName;
    LocalDate startDate;
    LocalDate endDate;
    int quantityDay;
    int quantityPeople;
    Double adultPrice;
    Double childrenPrice;
}