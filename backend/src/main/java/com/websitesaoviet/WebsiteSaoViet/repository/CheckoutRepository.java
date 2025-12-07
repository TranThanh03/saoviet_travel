package com.websitesaoviet.WebsiteSaoViet.repository;

import com.websitesaoviet.WebsiteSaoViet.entity.Checkout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface CheckoutRepository extends JpaRepository<Checkout, String> {
    @Query("SELECT c " +
            "FROM Checkout c " +
            "INNER JOIN Booking b ON c.bookingId = b.id " +
            "WHERE c.orderId = :orderId AND c.status = 'Chưa thanh toán' AND b.status = 'Đang xử lý'")
    Checkout findUnpaidCheckoutByOrderId(@Param("orderId") String orderId);

    @Query("SELECT c " +
            "FROM Checkout c " +
            "INNER JOIN Booking b ON c.bookingId = b.id " +
            "WHERE c.id = :id AND c.status = 'Chưa thanh toán' AND b.status = 'Đang xử lý'")
    Checkout findUnpaidCheckoutById(@Param("id") String id);

    @Query("SELECT COUNT(c) > 0 " +
            "FROM Checkout c " +
            "INNER JOIN Booking b ON c.bookingId = b.id " +
            "WHERE c.code = :code AND b.customerId = :customerId AND c.status = 'Đã thanh toán'")
    boolean validateCheckoutIsPaid(@Param("code") String code, @Param("customerId") String customerId);

    @Query("SELECT COUNT(c) > 0 " +
            "FROM Checkout c " +
            "WHERE c.bookingId = :bookingId AND c.status = 'Đã thanh toán'")
    boolean validateCheckoutIsPaidByBookingId(@Param("bookingId") String bookingId);

    boolean existsByCode(String code);

    boolean existsByBookingIdAndMethodAndStatus(String bookingId, String method, String status);

    @Transactional
    @Modifying
    @Query("UPDATE Checkout c SET c.orderId = :orderId WHERE c.bookingId = :bookingId")
    void markAsOrderId(@Param("bookingId") String bookingId, @Param("orderId") String orderId);
}