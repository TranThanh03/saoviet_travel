package com.websitesaoviet.WebsiteSaoViet.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ChatMessagesResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ChatToursResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.ChatSessions;
import com.websitesaoviet.WebsiteSaoViet.entity.Messages;
import com.websitesaoviet.WebsiteSaoViet.enums.CommonStatus;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.repository.ChatSessionsRepository;
import com.websitesaoviet.WebsiteSaoViet.repository.MessagesRepository;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Map;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatbotService {
    @NonFinal
    @Value("${gemini.api-key}")
    private String GEMINI_API_KEY;

    @NonFinal
    @Value("${gemini.url}")
    private String GEMINI_URL;

    @NonFinal
    private final RestTemplate restTemplate = new RestTemplate();

    @NonFinal
    @Value("${app.fe-base-url}")
    protected String FE_BASE_URL;

    ChatSessionsRepository chatSessionsRepository;
    MessagesRepository messagesRepository;
    SequenceService sequenceService;

    public String sendPrompt(String message) {
        try {
            String url = String.format("%s?key=%s", GEMINI_URL, GEMINI_API_KEY);
            LocalDate currentDate = LocalDate.now();

            String systemInstruction =
                    "Bạn là một trợ lý chuyên hỗ trợ thông tin về tour du lịch tại Việt Nam và thông tin về công ty du lịch Sao Việt. " +
                    "Chỉ trả lời các câu hỏi liên quan đến tour ở Việt Nam và công ty du lịch Sao Việt. " +
                    "Không được lặp lại câu hỏi của người dùng trong câu trả lời. " +

                    // DESTINATION
                    "Nếu trong câu hỏi có nhắc đến điểm đến hoặc tên tour (ví dụ: Hà Nội, Hạ Long...), thì gán vào 'destination'. " +
                    "Nếu chỉ có một điểm đến hoặc tour, trả về JSON với định dạng: {\"destination\": \"Hà Nội\"}. " +
                    "Nếu có từ hai điểm đến hoặc tour trở lên (dấu phẩy, dấu gạch ngang,...), trả về: {\"destination\": [\"Hà Nội\", \"Hạ Long\"]}. " +

                    // DURATION
                    "Nếu có thông tin về thời gian tour, như: 2 ngày, 2 ngày 2 đêm, 3 ngày, 3 ngày 2 đêm,..., thì chỉ gán số ngày(bỏ đêm) vào 'quantityDay'. " +

                    // AREA
                    "Nếu nhắc đến miền/khu vực (Miền Bắc, Miền Trung, Miền Nam), gán vào 'area' với giá trị tương ứng: 'b', 't', 'n'. " +

                    // START & END DATE
                    "Biết hiện nay là ngày: " + currentDate + ". " +
                    "Với các cụm từ chỉ thời gian không cụ thể như: 'tháng này', 'hiện nay', 'năm nay', hãy tự động hiểu và chuyển thành giá trị tương ứng theo thời gian hiện tại. " +
                    "Ví dụ: 'tháng này' → sử dụng tháng hiện tại, 'năm nay' → sử dụng năm hiện tại, 'hiện nay' → sử dụng ngày hiện tại. " +
                    "Nếu người dùng nhập: 'ngày mùng 8', 'vào ngày 10', thì gán ngày đó trong tháng và năm hiện tại, định dạng 'YYYY-MM-DD'. " +
                    "Nếu chỉ có tháng (ví dụ: 'tháng 8') mà không có ngày hoặc năm cụ thể, thì gán như sau: " +
                    "- 'startDate' = ngày đầu tiên của tháng đó trong năm hiện tại. " +
                    "- 'endDate' = ngày cuối cùng của tháng đó trong năm hiện tại. " +
                    "Tương tự, nếu người dùng nhập 'tháng này' thì 'startDate' và 'endDate' lần lượt là ngày đầu tiên và cuối cùng của tháng hiện tại. " +
                    "Nếu người dùng nhập 'khởi hành' đầu tháng X, thì 'startDate' = ngày đầu tiên của tháng X trong năm hiện tại. " +
                    "Nếu người dùng nhập 'khởi hành' giữa tháng X, thì 'startDate' = ngày giữa của tháng X trong năm hiện tại. " +
                    "Nếu người dùng nhập 'khởi hành' cuối tháng X, thì 'startDate' = ngày cuối cùng của tháng X trong năm hiện tại. " +
                    "Nếu người dùng nhập 'kết thúc' đầu tháng X, thì 'endDate' = ngày đầu tiên của tháng X trong năm hiện tại. " +
                    "Nếu người dùng nhập 'kết thúc' giữa tháng X, thì 'endDate' = ngày giữa của tháng X trong năm hiện tại. " +
                    "Nếu người dùng nhập 'kết thúc' cuối tháng X, thì 'endDate' = ngày cuối cùng của tháng X trong năm hiện tại. " +
                    "Nếu không thể xác định rõ ngày hợp lệ, trả về thông báo lỗi: \"Vui lòng cung cấp thông tin thời gian đầy đủ hoặc cụ thể hơn, ví dụ: 25/05/2025.\" " +

                    // PRICE
                    "Nếu có đề cập đến giá cụ thể (ví dụ: 5 triệu, 5.000.000), gán vào 'maxPrice'. " +
                    "Nếu có khoảng giá (ví dụ: 4 đến 5 triệu, 4.000.000 - 5.000.000), gán vào 'minPrice' và 'maxPrice'. " +

                    // SORT
                    "Nếu có yêu cầu sắp xếp như 'mới nhất', 'cũ nhất', 'giá cao đến thấp', 'giá thấp đến cao', thì gán vào 'sorted' lần lượt là: 'new', 'old', 'high-to-low', 'low-to-high'. " +

                    // HOT DESTINATIONS
                    "Nếu câu hỏi yêu cầu danh sách điểm đến phổ biến, tour hot..., hãy tìm kiếm trên internet và trả về 'destination' là danh sách tên (chỉ tên, loại bỏ mô tả không cần thiết). " +

                    // RESPONSE FORMAT
                    "Nếu truy xuất được một hoặc nhiều thuộc tính: destination, quantityDay, area, startDate, endDate, minPrice, maxPrice, sorted, thì chỉ trả về JSON chứa các thuộc tính đó. " +
                    "Nếu có lỗi định dạng hoặc thông tin không hợp lệ (ví dụ ngày sai định dạng), chỉ trả về văn bản mô tả lỗi, không kèm theo JSON. " +
                    "Tuyệt đối không kết hợp cả văn bản và JSON trong một câu trả lời. " +

                    // INFOR SAO VIET
                    "Nếu câu hỏi liên quan đến LIÊN HỆ của công ty du lịch Sao Việt thì đưa ra: " +
                    "Thông tin liên hệ Sao Việt: " +
                    "Địa chỉ: 1 Hoàng Công Chất, Phú Diễn, Bắc Từ Liêm, Hà Nội. " +
                    "Số điện thoại: 0399.999.999. " +
                    "Email: support@saoviet.com. " +
                    "Website: " + FE_BASE_URL +
                    "Ngược lại nếu câu hỏi KHÔNG LIÊN QUAN đến LIÊN HỆ thì tìm kiếm thông tin trên Internet và đưa ra câu trả lời. " +

                    // FALLBACK
                    "Nếu câu hỏi không liên quan đến bất kỳ thuộc tính nào nêu trên, bạn được phép tìm kiếm thông tin trên internet và trả lời bằng văn bản.";

            String finalPrompt = systemInstruction + "\n\nCâu hỏi: " + message;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", finalPrompt))))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, Map.class
            );

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            Map<String, Object> first = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) first.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String text = parts.get(0).get("text").toString().replaceAll("\n", "").trim();

            if (text.startsWith("```json")) {
                text = text.replaceAll("```json", "").replaceAll("```", "").trim();
            }

            return text;
        } catch (Exception e) {
            log.error("Chatbot error: ", e);
            throw new AppException(ErrorCode.CHATBOT_ERROR);
        }
    }

    public String generateCode() {
        return getNextCode("chatbot");
    }

    public List<ChatMessagesResponse> getChatByCustomerCode(String code) {
        if (!chatSessionsRepository.existsChatSessionsByCustomerCode(code)) {
            ChatSessions chatSessions = new ChatSessions();

            chatSessions.setCustomerCode(code);
            chatSessions.setStartedAt(LocalDateTime.now());
            chatSessions.setStatus(CommonStatus.IN_PROGRESS.getValue());

            chatSessionsRepository.save(chatSessions);
        }

        List<ChatMessagesResponse> messages = chatSessionsRepository.findByCustomerCode(code);

        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();

        for (ChatMessagesResponse msg : messages) {
            Object contentObj = msg.getContent();

            if (contentObj instanceof String) {
                String content = ((String) contentObj).trim();

                if (content.startsWith("[") && content.endsWith("]")) {
                    try {
                        List<Map<String, Object>> parsedContent = mapper.readValue(
                                content, new TypeReference<List<Map<String, Object>>>() {});
                        msg.setContent(parsedContent);
                    } catch (Exception e) {

                        e.printStackTrace();
                    }
                }
            }
        }

        return messages;
    }

    public void updateChat(String id, String inputMessage) {
        chatSessionsRepository.update(id, LocalDateTime.now());
        createMessage(id, "customer", inputMessage.trim().replaceAll("\"", ""), null);
    }

    public void createMessage(String chatId, String senderType, String message, List<ChatToursResponse> result) {
        String content = "";
        Messages messages = new Messages();

        try {
            if (result != null) {
                ObjectMapper mapper = new ObjectMapper();
                mapper.registerModule(new JavaTimeModule());
                mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

                content = mapper.writeValueAsString(result);
            } else {
                content = message.trim();
            }

            messages.setChatId(chatId);
            messages.setSenderType(senderType);
            messages.setContent(content);
            messages.setCreatedAt(LocalDateTime.now());

            messagesRepository.save(messages);
        } catch (Exception e) {
            log.error("Chatbot error: ", e);
            throw new AppException(ErrorCode.CHATBOT_ERROR);
        }
    }

    public String getNextCode(String type) {
        int nextCode = sequenceService.getNextNumber(type.toLowerCase());

        return "CB" + Year.now().getValue() + String.format("%06d", nextCode);
    }
}
