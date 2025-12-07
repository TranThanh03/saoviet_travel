package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.entity.CustomerPromotion;
import com.websitesaoviet.WebsiteSaoViet.repository.CustomerPromotionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerPromotionService {
    CustomerPromotionRepository customerPromotionRepository;

    public void createCustomerPromotion(String customerId, String promotionId) {
        LocalDateTime currentTime = LocalDateTime.now();
        CustomerPromotion customerPromotion = CustomerPromotion.builder()
                .customerId(customerId)
                .promotionId(promotionId)
                .createdAt(currentTime)
                .build();

        customerPromotionRepository.save(customerPromotion);
    }

    public boolean validCustomerPromotion(String customerId, String promotionId) {
        if (customerPromotionRepository.existsByCustomerIdAndPromotionId(customerId, promotionId)) {
            return true;
        }

        return false;
    }

    public void deleteByCustomerIdAndPromotionId(String customerId, String promotionId) {
        customerPromotionRepository.deleteByCustomerIdAndPromotionId(customerId, promotionId);
    }
}