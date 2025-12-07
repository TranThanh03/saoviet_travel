 package com.websitesaoviet.WebsiteSaoViet.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsCreationRequest {
    @NotBlank(message = "NOT_NULL")
    String title;

    @NotBlank(message = "NOT_NULL")
    String summary;

    @NotBlank(message = "NOT_NULL")
    String image;

    @NotBlank(message = "NOT_NULL")
    String content;

    @NotBlank(message = "NOT_NULL")
    String type;
}