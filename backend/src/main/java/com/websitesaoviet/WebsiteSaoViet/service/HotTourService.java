package com.websitesaoviet.WebsiteSaoViet.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.websitesaoviet.WebsiteSaoViet.entity.HotTour;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.repository.HotTourRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HotTourService {
    HotTourRepository hotTourRepository;
    ChatbotService chatbotService;

    public void createHotTour(String destination) {
        HotTour hotTour = new HotTour();

        hotTour.setDestination(destination);
        hotTour.setCreatedTime(LocalDate.now());

        hotTourRepository.save(hotTour);
    }

    public void updateHotTour(String id, String destination) {
        HotTour hotTour = hotTourRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOTTOUR_NOT_EXITED));

        hotTour.setDestination(destination);
        hotTour.setCreatedTime(LocalDate.now());

        hotTourRepository.save(hotTour);
    }

    public String checkHotTour() {
        HotTour hotTour = hotTourRepository.findSingleHotTour();
        LocalDate currentDay = LocalDate.now();
        String message = "Danh sách top 10 các điểm đến phổ biến nhất hiện nay?";
        String destination = "";

        if (hotTour == null) {
            String text = chatbotService.sendPrompt(message);

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> mapJson = null;
            try {
                mapJson = objectMapper.readValue(text, Map.class);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }

            Object destinationObj = mapJson.get("destination");

            if (destinationObj instanceof List) {
                List<?> list = (List<?>) destinationObj;

                if (!list.isEmpty() && list.get(0) instanceof String) {
                    List<String> destinations = (List<String>) destinationObj;

                    if (!destinations.isEmpty()) {
                        destination = String.join(", ", destinations);
                        createHotTour(destination);
                    }
                }
            }
        } else if (currentDay.isAfter(hotTour.getCreatedTime().plusWeeks(1))) {
            String text = chatbotService.sendPrompt(message);

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> mapJson = null;
            try {
                mapJson = objectMapper.readValue(text, Map.class);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }

            Object destinationObj = mapJson.get("destination");

            if (destinationObj instanceof List) {
                List<?> list = (List<?>) destinationObj;

                if (!list.isEmpty() && list.get(0) instanceof String) {
                    List<String> destinations = (List<String>) destinationObj;

                    if (!destinations.isEmpty()) {
                        destination = String.join(", ", destinations);
                        updateHotTour(hotTour.getId(), destination);
                    }
                }
            }
        } else {
            destination = hotTour.getDestination();
        }

        return destination;
    }
}