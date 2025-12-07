package com.websitesaoviet.WebsiteSaoViet.repository;

import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.PromotionListResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.PromotionSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, String> {
    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.user.PromotionSummaryResponse(" +
            "p.id, p.code, p.title, p.description, p.discount, p.endDate, p.quantity) " +
            "FROM Promotion p " +
            "LEFT JOIN CustomerPromotion cp " +
            "ON cp.promotionId = p.id " +
            "AND cp.customerId = :customerId " +
            "WHERE cp.customerId IS NULL AND p.status = 'Đang diễn ra' AND p.quantity > 0 " +
            "ORDER BY p.endDate ASC")
    List<PromotionSummaryResponse> findPromotionList(@Param("customerId") String customerId);

    @Query("SELECT p " +
            "FROM Promotion p " +
            "WHERE p.id = :id AND p.startDate <= :currentDate AND p.endDate >= :currentDate AND p.quantity > 0")
    Promotion findAvailablePromotionById(@Param("id") String id, @Param("currentDate") LocalDate currentDate);

    boolean existsByCode(String code);

    @Transactional
    @Modifying
    @Query("UPDATE Promotion p SET p.quantity = p.quantity - :quantity WHERE p.id = :id")
    void minusQuantity(@Param("id") String id, @Param("quantity") int quantity);

    @Transactional
    @Modifying
    @Query("UPDATE Promotion p SET p.quantity = p.quantity + :quantity WHERE p.id = :id")
    void addQuantity(@Param("id") String id, @Param("quantity") int quantity);

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.admin.PromotionListResponse(" +
            "p.id, p.code, p.title, p.discount, p.startDate, p.endDate, p.quantity, p.status) " +
            "FROM Promotion p " +
            "WHERE " +
            "(:keywordText IS NULL OR " +
            "  UPPER(p.code) LIKE CONCAT('%', UPPER(:keywordText), '%')) " +
            "AND (:keywordDate IS NULL OR p.startDate = :keywordDate) " +
            "ORDER BY " +
            "CASE " +
            "   WHEN p.status = 'Chưa diễn ra' THEN 0 " +
            "   WHEN p.status = 'Đang diễn ra' THEN 1 " +
            "   WHEN p.status = 'Đã kết thúc' THEN 2 " +
            "   ELSE 3 " +
            "END, p.createdTime DESC")
    Page<PromotionListResponse> findAllPromotions(@Param("keywordText") String keywordText,
                                                 @Param("keywordDate") LocalDate keywordDate,
                                                 Pageable pageable);

    boolean existsPromotionByIdAndStatusNot(String id, String status);
}