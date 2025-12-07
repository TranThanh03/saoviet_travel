package com.websitesaoviet.WebsiteSaoViet.dto.request.admin;

import com.websitesaoviet.WebsiteSaoViet.entity.Itinerary;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TourUpdateRequest {
    @NotBlank(message = "NOT_NULL")
    String name;

    @NotBlank(message = "NOT_NULL")
    String destination;

    @NotBlank(message = "NOT_NULL")
    String area;

    @NotEmpty(message = "NOT_NULL")
    List<String> image;

    @NotEmpty(message = "NOT_NULL")
    List<Itinerary> itinerary;

    @NotBlank(message = "NOT_NULL")
    String description;

    @Min(value = 1, message = "DAY_INVALID")
    int quantityDay;
}