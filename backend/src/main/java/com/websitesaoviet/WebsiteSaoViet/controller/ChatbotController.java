package com.websitesaoviet.WebsiteSaoViet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ApiResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ChatMessagesResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ChatToursResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.service.ChatbotService;
import com.websitesaoviet.WebsiteSaoViet.service.TourService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatbotController {

    ChatbotService chatbotService;
    TourService tourService;

    @PostMapping("/{id}")
    public ResponseEntity<ApiResponse<List<ChatToursResponse>>> ask(@PathVariable String id,
                                                                    @RequestBody String inputMessage) {
        String text = chatbotService.sendPrompt(inputMessage.trim());
        chatbotService.updateChat(id, inputMessage.trim());

        String message = "";
        List<ChatToursResponse> result = null;

        try {
            if (text.startsWith("{")) {
                ObjectMapper objectMapper = new ObjectMapper();
                Map<String, Object> extractedParams = objectMapper.readValue(text, Map.class);

                result = tourService.getChatTours(extractedParams);

                if (result == null || result.isEmpty()) {
                    message = "Không tìm được tour phù hợp với yêu cầu.";
                    result = null;
                }
            } else {
                message = text;
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.CHATBOT_ERROR);
        }

        chatbotService.createMessage(id, "chatbot", message, result);

        ApiResponse<List<ChatToursResponse>> apiResponse = ApiResponse.<List<ChatToursResponse>>builder()
                .code(2200)
                .message(message)
                .result(result)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/generate-code")
    public ResponseEntity<ApiResponse<String>> check() {
        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(2201)
                .result(chatbotService.generateCode())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<List<ChatMessagesResponse>>> getChatByCustomerCode(@PathVariable String code) {
        ApiResponse<List<ChatMessagesResponse>> apiResponse = ApiResponse.<List<ChatMessagesResponse>>builder()
                .code(2202)
                .result(chatbotService.getChatByCustomerCode(code))
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}