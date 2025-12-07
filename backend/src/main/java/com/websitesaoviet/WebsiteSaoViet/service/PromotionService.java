package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.PromotionCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.PromotionUpdateRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.PromotionListResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.PromotionResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.PromotionSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Promotion;
import com.websitesaoviet.WebsiteSaoViet.enums.CommonStatus;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.mapper.PromotionMapper;
import com.websitesaoviet.WebsiteSaoViet.repository.PromotionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PromotionService {
    PromotionRepository promotionRepository;
    PromotionMapper promotionMapper;

    public PromotionResponse createPromotion(PromotionCreationRequest request) {
        LocalDateTime currentTime = LocalDateTime.now();
        LocalDate today = LocalDate.now();
        LocalDate minStartDate = today.plusDays(1);

        if (promotionRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new AppException(ErrorCode.PROMOTION_CODE_AVAILABLE);
        }

        if (request.getStartDate().isBefore(minStartDate)) {
            throw new AppException(ErrorCode.PROMOTION_STARTDATE_INVALID);
        }
        else if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.PROMOTION_ENDDATE_INVALID);
        }

        Promotion promotion = promotionMapper.createPromotion(request);

        promotion.setCode(request.getCode().trim().toUpperCase());
        promotion.setStatus(CommonStatus.NOT_STARTED.getValue());
        promotion.setCreatedTime(currentTime);

        return promotionMapper.toPromotionResponse(promotionRepository.save(promotion));
    }

    public Page<PromotionListResponse> getPromotions(String keyword, Pageable pageable) {
        String keywordText = keyword.trim();
        LocalDate keywordDate = null;

        if (!keywordText.equals("") && !keywordText.matches("^[a-zA-Z0-9]+$")) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
                keywordDate = LocalDate.parse(keyword, formatter);
                keywordText = null;
            } catch (Exception ignored) {
                throw new AppException(ErrorCode.DATETIME_INVALID);
            }
        }

        return promotionRepository.findAllPromotions(keywordText, keywordDate, pageable);
    }

    public List<PromotionSummaryResponse> getPromotionList() {
        return promotionRepository.findPromotionList();
    }

    public PromotionResponse getPromotionById(String id) {
        return promotionMapper.toPromotionResponse(promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_EXITED)));
    }

    public PromotionResponse getPromotionByIdAndAdmin(String id) {
        boolean checkPromotion = promotionRepository.existsPromotionByIdAndStatusNot(id, CommonStatus.COMPLETED.getValue());

        if (checkPromotion) {
            return promotionMapper.toPromotionResponse(promotionRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_EXITED)));
        } else {
            throw new AppException(ErrorCode.PROMOTION_NOT_EXITED);
        }
    }
    
    public Promotion getAvailablePromotionById(String id) {
        return promotionRepository.findAvailablePromotionById(id);
    }

    public PromotionResponse updatePromotion(String id, PromotionUpdateRequest request) {
        boolean checkPromotion = promotionRepository.existsPromotionByIdAndStatusNot(id, CommonStatus.COMPLETED.getValue());

        if (checkPromotion) {
            var promotion = promotionRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_EXITED));

            LocalDate today = LocalDate.now();
            LocalDate minStartDate = today.plusDays(1);

            if (request.getStartDate().isBefore(minStartDate)) {
                throw new AppException(ErrorCode.PROMOTION_STARTDATE_INVALID);
            }
            else if (request.getEndDate().isBefore(request.getStartDate())) {
                throw new AppException(ErrorCode.PROMOTION_ENDDATE_INVALID);
            }

            promotion.setTitle(request.getTitle());
            promotion.setDescription(request.getDescription());
            promotion.setDiscount(request.getDiscount());

            if (promotion.getStatus().equals(CommonStatus.NOT_STARTED.getValue())) {
                promotion.setStartDate(request.getStartDate());
            }

            promotion.setEndDate(request.getEndDate());
            promotion.setQuantity(request.getQuantity());

            return promotionMapper.toPromotionResponse(promotionRepository.save(promotion));
        } else {
            throw new AppException(ErrorCode.PROMOTION_NOT_EXITED);
        }
    }

    @Transactional
    public void deletePromotion(String id) {
        if (!promotionRepository.existsById(id)) {
            throw new AppException(ErrorCode.PROMOTION_NOT_EXITED);
        }

        promotionRepository.deleteById(id);
    }

    public void minusQuantity(String id, int quantity) {
        promotionRepository.minusQuantity(id, quantity);
    }

    public void addQuantity(String id, int quantity) {
        promotionRepository.addQuantity(id, quantity);
    }
}