package com.websitesaoviet.WebsiteSaoViet.dto.request.admin;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleCreationRequest {
    @NotBlank(message = "NOT_NULL")
    String tourId;

    @NotNull(message = "STARTDATE_NOT_NULL")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate startDate;

    @Min(value = 1, message = "TOTAL_PEOPLE_INVALID")
    @Max(value = 99, message = "TOTAL_PEOPLE_INVALID")
    int totalPeople;

    @Min(value = 1, message = "PRICE_INVALID")
    Double adultPrice;

    @Min(value = 1, message = "PRICE_INVALID")
    Double childrenPrice;
}