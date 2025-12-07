package com.websitesaoviet.WebsiteSaoViet.controller;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.EmailRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.service.MailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mail")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MailController {
     MailService mailService;

    @PreAuthorize("hasRole('ADMIN')")
     @PostMapping("/send")
     ResponseEntity<ApiResponse<String>> sendEmail(@RequestBody EmailRequest request) {
         mailService.sendMail(request.getTo(), request.getSubject(), request.getText());

         ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                 .code(1400)
                 .message("Gửi email thành công.")
                 .build();

         return ResponseEntity.ok(apiResponse);
     }
}