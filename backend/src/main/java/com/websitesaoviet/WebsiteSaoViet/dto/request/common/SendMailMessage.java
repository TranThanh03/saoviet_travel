package com.websitesaoviet.WebsiteSaoViet.dto.request.common;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendMailMessage {
    String to;
    String subject;
    String content;
    int retryCount;
}