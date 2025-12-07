package com.websitesaoviet.WebsiteSaoViet.repository;

import com.websitesaoviet.WebsiteSaoViet.entity.CustomerPromotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface CustomerPromotionRepository extends JpaRepository<CustomerPromotion, String> {
    boolean existsByCustomerIdAndPromotionId(String customerId, String promotionId);

    @Modifying
    @Transactional
    @Query("DELETE FROM CustomerPromotion cp WHERE cp.customerId = :customerId AND cp.promotionId = :promotionId")
    void deleteByCustomerIdAndPromotionId(String customerId, String promotionId);
}