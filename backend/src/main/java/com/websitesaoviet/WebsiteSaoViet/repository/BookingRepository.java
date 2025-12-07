package com.websitesaoviet.WebsiteSaoViet.repository;

import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.*;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.BookingDetailResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    Booking findBookingByIdAndStatus(String id, String status);

    @Query("SELECT b " +
            "FROM Booking b " +
            "INNER JOIN Checkout c ON b.id = c.bookingId " +
            "WHERE b.id = :id AND b.status = 'Đang xử lý' AND c.status = 'Đã thanh toán'")
    Booking findBookingPaid(@Param("id") String id);

    Booking findBookingByIdAndStatusAndIsReserved(String id, String status, boolean isReserved);

    @Query("SELECT COUNT(b) > 0 " +
            "FROM Booking b " +
            "WHERE b.customerId = :customerId AND b.status = 'Đang xử lý'")
    boolean existsByCustomerId(@Param("customerId") String customerId);

    @Query("SELECT COUNT(b) > 0 " +
            "FROM Booking b " +
            "WHERE b.scheduleId = :scheduleId AND b.status = 'Đang xử lý'")
    boolean existsByScheduleId(@Param("scheduleId") String scheduleId);

    @Query("SELECT COUNT(b) > 0 " +
            "FROM Booking b " +
            "WHERE b.tourId = :tourId AND b.status = 'Đang xử lý'")
    boolean existsByTourId(@Param("tourId") String tourId);

    Booking findBookingByIdAndCustomerIdAndIsReviewed(String id, String customerId, boolean isReviewed);

    @Query(value = """
    SELECT b.id, b.code, b.tour_id, b.tour_name,
        (SELECT i.image FROM tour_images i WHERE i.tour_id = t.id LIMIT 1) AS image,
        t.destination, b.quantity_day, (b.quantity_adult + b.quantity_children) AS people, b.total_price,
        IFNULL(FLOOR(AVG(r.rating)), 0) AS rating,
        b.booking_time, b.status, b.is_reviewed, c.method
    FROM booking b
    INNER JOIN checkout c ON b.id = c.booking_id
    LEFT JOIN tour t ON b.tour_id = t.id
    LEFT JOIN review r ON b.tour_id = r.tour_id
    WHERE b.customer_id = :customerId
    GROUP BY b.id, c.id
    ORDER BY CASE WHEN b.status = 'Đang xử lý' THEN 0 ELSE 1 END, b.booking_time DESC
    """, nativeQuery = true)
    List<Object[]> findBookingsByCustomerId(@Param("customerId") String customerId);

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.user.BookingDetailResponse(" +
            "b.id, b.code, b.customerId, b.tourId, b.tourCode, b.tourName, b.startDate, b.endDate, b.quantityDay, " +
            "b.quantityAdult, b.quantityChildren, b.adultPrice, b.childrenPrice, " +
            "b.discount, b.totalPrice, b.bookingTime, b.status, b.isReviewed, " +
            "c.code, c.method, c.checkoutTime, c.status) " +
            "FROM Booking b " +
            "INNER JOIN Checkout c ON b.id = c.bookingId " +
            "WHERE b.id = :id")
    BookingDetailResponse findBookingDetail(@Param("id") String id);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'Đã xác nhận'")
    long countBookings();

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = 'Đã xác nhận'")
    long totalRevenue();

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.admin.BookingsLatestResponse(" +
            "b.id, b.code, c.fullName, b.totalPrice, b.bookingTime) " +
            "FROM Booking b " +
            "LEFT JOIN Customer c ON b.customerId = c.id " +
            "WHERE b.status = 'Đang xử lý'" +
            "ORDER BY b.bookingTime DESC " +
            "LIMIT 5")
    List<BookingsLatestResponse> findBookingsLatest();

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.admin.PopularToursResponse(" +
            "b.tourCode, b.tourName, COUNT(b)) " +
            "FROM Booking b " +
            "WHERE FUNCTION('MONTH', b.bookingTime) = FUNCTION('MONTH', :currentDate) " +
            "AND FUNCTION('YEAR', b.bookingTime) = FUNCTION('YEAR', :currentDate) " +
            "GROUP BY b.tourCode, b.tourName " +
            "ORDER BY COUNT(b) DESC " +
            "LIMIT 5")
    List<PopularToursResponse> findTopPopularToursThisMonth(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.admin.BookingStatusCountsResponse(" +
            "SUM(CASE WHEN b.status = 'Đang xử lý' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN b.status = 'Đã hủy' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN b.status = 'Đã xác nhận' THEN 1 ELSE 0 END)) " +
            "FROM Booking b")
    BookingStatusCountsResponse findStatusCounts();

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.admin.BookingStatisticResponse(" +
            "MONTH(b.bookingTime), " +
            "SUM(CASE WHEN b.status = 'Đã hủy' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN b.status = 'Đã xác nhận' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN b.status = 'Đã xác nhận' THEN b.totalPrice ELSE 0 END)) " +
            "FROM Booking b " +
            "WHERE YEAR(b.bookingTime) = :year " +
            "GROUP BY MONTH(b.bookingTime) " +
            "ORDER BY MONTH(b.bookingTime)")
    List<BookingStatisticResponse> findBookingStatisticByYear(@Param("year") Integer year);

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.admin.BookingListResponse(" +
            "b.id, b.code, b.customerCode, b.tourCode, b.scheduleCode, b.totalPrice, b.bookingTime, c.status, b.status) " +
            "FROM Booking b " +
            "LEFT JOIN Checkout c ON b.id = c.bookingId " +
            "WHERE " +
            "(:keyword IS NULL OR " +
            "  UPPER(b.code) LIKE CONCAT('%', UPPER(:keyword), '%') OR " +
            "  UPPER(b.customerCode) LIKE CONCAT('%', UPPER(:keyword), '%') OR " +
            "  UPPER(b.tourCode) LIKE CONCAT('%', UPPER(:keyword), '%') OR " +
            "  UPPER(b.scheduleCode) LIKE CONCAT('%', UPPER(:keyword), '%')) " +
            "ORDER BY CASE WHEN b.status = 'Đang xử lý' THEN 0 ELSE 1 END, b.bookingTime DESC")
    Page<BookingListResponse> findAllBookings(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.admin.BookingCheckoutDetailResponse(" +
            "b.id, b.code, u.fullName, u.phone, u.email, b.tourName, b.startDate, b.endDate, " +
            "b.quantityAdult, b.quantityChildren, b.adultPrice, b.childrenPrice, " +
            "b.discount, b.totalPrice, b.bookingTime, b.status, b.isReserved, " +
            "c.id, c.code, c.method, c.checkoutTime, c.status) " +
            "FROM Booking b " +
            "INNER JOIN Checkout c ON b.id = c.bookingId " +
            "LEFT JOIN Customer u ON b.customerId = u.id " +
            "WHERE b.id = :id")
    BookingCheckoutDetailResponse findBookingCheckoutDetail(@Param("id") String id);
}