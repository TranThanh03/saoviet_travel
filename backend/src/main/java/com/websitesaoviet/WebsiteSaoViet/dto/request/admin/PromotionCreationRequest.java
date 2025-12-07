package com.websitesaoviet.WebsiteSaoViet.dto.request.admin;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionCreationRequest {
    @NotBlank(message = "NOT_NULL")
    String code;

    @NotBlank(message = "NOT_NULL")
    String title;

    @NotBlank(message = "NOT_NULL")
    String description;

    @Min(value = 1, message = "DISCOUNT_INVALID")
    Double discount;

    @NotNull(message = "PROMOTION_STARTDATE_NOT_NULL")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate startDate;

    @NotNull(message = "ENDDATE_NOT_NULL")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate endDate;

    @Min(value = 1, message = "QUANTITY_INVALID")
    int quantity;
}