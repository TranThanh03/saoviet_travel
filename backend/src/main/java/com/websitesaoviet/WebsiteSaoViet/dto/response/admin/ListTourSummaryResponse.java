package com.websitesaoviet.WebsiteSaoViet.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ListTourSummaryResponse {
    String id;
    String code;
    String name;
    String destination;
    String area;
    int quantityDay;
    int quantityOrder;
    LocalDateTime timeStamp;
}