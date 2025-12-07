package com.websitesaoviet.WebsiteSaoViet.dto.request.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingProcessionRequest {
    @NotBlank(message = "NOT_NULL")
    String scheduleId;

    String promotionId;

    @Min(value = 0, message = "QUANTITY_ADULT")
    @Max(value = 99, message = "QUANTITY_ADULT")
    int quantityAdult;

    @Min(value = 0, message = "QUANTITY_CHILDREN")
    @Max(value = 99, message = "QUANTITY_CHILDREN")
    int quantityChildren;

    @NotBlank(message = "NOT_NULL")
    String method;
}