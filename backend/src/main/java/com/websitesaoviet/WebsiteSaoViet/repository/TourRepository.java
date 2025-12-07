package com.websitesaoviet.WebsiteSaoViet.repository;

import com.websitesaoviet.WebsiteSaoViet.dto.response.user.AreaTourCountResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.TourBookingStatsResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.TourSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Tour;
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
public interface TourRepository extends JpaRepository<Tour, String> {
    @Transactional
    @Modifying
    @Query("UPDATE Tour t SET t.quantityOrder = t.quantityOrder + :orders WHERE t.id = :id")
    void addOrders(@Param("id") String id, @Param("orders") int orders);

    @Query(value = """
    SELECT t.id, t.name, t.destination,
        (SELECT i.image FROM tour_images i WHERE i.tour_id = t.id LIMIT 1) AS image,
        t.quantity_day,
        MIN(s.adult_price) AS adult_price,
        (
            SELECT IFNULL(SUM(s2.total_people - s2.quantity_people), 0)
            FROM schedule s2
            WHERE s2.tour_id = t.id AND s2.status = 'Chưa diễn ra' AND s2.quantity_people < s2.total_people AND
            (:minPrice IS NULL OR s2.adult_price >= :minPrice) AND
            (:maxPrice IS NULL OR s2.adult_price <= :maxPrice)
        ) AS people,
        IFNULL(FLOOR((
            SELECT AVG(r2.rating)
            FROM review r2
            WHERE r2.tour_id = t.id
        )), 0) AS rating,
        MAX(s.created_time) AS created_time
    FROM tour t
    INNER JOIN schedule s ON t.id = s.tour_id
    WHERE
        (s.status = 'Chưa diễn ra') AND
        (s.quantity_people < s.total_people) AND
        (:minPrice IS NULL OR s.adult_price >= :minPrice) AND
        (:maxPrice IS NULL OR s.adult_price <= :maxPrice) AND
        (:area IS NULL OR t.area = :area) AND
        (:quantityDay IS NULL OR t.quantity_day = :quantityDay)
    GROUP BY t.id, t.name, t.destination, t.quantity_day
    HAVING (:rating IS NULL OR FLOOR((
        SELECT AVG(r3.rating)
        FROM review r3
        WHERE r3.tour_id = t.id
    )) = :rating)
    """,
            countQuery = """
    SELECT COUNT(DISTINCT t.id)
    FROM tour t
    INNER JOIN schedule s ON t.id = s.tour_id
    WHERE
        (s.status = 'Chưa diễn ra') AND
        (s.quantity_people < s.total_people) AND
        (:minPrice IS NULL OR s.adult_price >= :minPrice) AND
        (:maxPrice IS NULL OR s.adult_price <= :maxPrice) AND
        (:area IS NULL OR t.area = :area) AND
        (:quantityDay IS NULL OR t.quantity_day = :quantityDay)
    GROUP BY t.id
    HAVING (:rating IS NULL OR FLOOR((
        SELECT AVG(r3.rating)
        FROM review r3
        WHERE r3.tour_id = t.id
    )) = :rating)
    """,
            nativeQuery = true)
    Page<Object[]> findFilteredTours(
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("area") String area,
            @Param("rating") Integer rating,
            @Param("quantityDay") Integer quantityDay,
            Pageable pageable
    );

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.user.AreaTourCountResponse(" +
            "SUM(CASE WHEN t.area = 'b' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN t.area = 't' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN t.area = 'n' THEN 1 ELSE 0 END)) " +
            "FROM Tour t")
    AreaTourCountResponse countToursByArea();

    @Query("SELECT t AS tour, COUNT(b.id) AS bookingCount " +
            "FROM Tour t " +
            "INNER JOIN Booking b ON t.id = b.tourId " +
            "WHERE EXISTS (" +
            "   SELECT 1 FROM Schedule s " +
            "   WHERE s.tourId = t.id " +
            "   AND s.status = 'Chưa diễn ra' " +
            "   AND s.quantityPeople < s.totalPeople" +
            ") " +
            "AND MONTH(b.bookingTime) = MONTH(CURRENT_DATE) " +
            "AND YEAR(b.bookingTime) = YEAR(CURRENT_DATE) " +
            "GROUP BY t " +
            "ORDER BY COUNT(b.id) DESC")
    List<TourBookingStatsResponse> findPopularTours(Pageable pageable);

    @Query("SELECT t " +
            "FROM Tour t " +
            "INNER JOIN Schedule s ON t.id = s.tourId " +
            "WHERE s.status = 'Chưa diễn ra' AND s.quantityPeople < s.totalPeople " +
            "ORDER BY t.quantityOrder DESC")
    List<Tour> find5PopularTours(Pageable pageable);

    @Query(value = """
    SELECT t.id, t.name, t.destination,
        (SELECT i.image FROM tour_images i WHERE i.tour_id = t.id LIMIT 1) AS image,
        t.quantity_day,
        MIN(s.adult_price) AS adult_price,
        (
            SELECT IFNULL(SUM(s2.total_people - s2.quantity_people), 0)
            FROM schedule s2
            WHERE s2.tour_id = t.id AND s2.status = 'Chưa diễn ra' AND s2.quantity_people < s2.total_people
        ) AS people,
        (
            SELECT IFNULL(FLOOR(AVG(r2.rating)), 0)
            FROM review r2
            WHERE r2.tour_id = t.id
        ) AS rating,
        MAX(s.created_time) AS created_time
    FROM tour t
    INNER JOIN schedule s ON t.id = s.tour_id
    WHERE s.status = 'Chưa diễn ra' AND s.quantity_people < s.total_people
    GROUP BY t.id, t.name, t.destination, t.quantity_day
    """, nativeQuery = true)
    List<Object[]> findSearchTours();

    @Query(value = """
    SELECT t.id, t.name, t.destination,
        (SELECT i.image FROM tour_images i WHERE i.tour_id = t.id LIMIT 1) AS image,
        t.quantity_day,
        MIN(s.adult_price) AS adult_price,
        (
            SELECT IFNULL(SUM(s2.total_people - s2.quantity_people), 0)
            FROM schedule s2
            WHERE s2.tour_id = t.id AND s2.status = 'Chưa diễn ra' AND s2.quantity_people < s2.total_people AND
            (:startDate IS NULL OR s2.start_date = :startDate) AND
            (:endDate IS NULL OR s2.end_date = :endDate)
        ) AS people,
        (
            SELECT IFNULL(FLOOR(AVG(r2.rating)), 0)
            FROM review r2
            WHERE r2.tour_id = t.id
        ) AS rating,
        MAX(s.created_time) AS created_time
    FROM tour t
    INNER JOIN schedule s ON t.id = s.tour_id
    WHERE s.status = 'Chưa diễn ra' AND s.quantity_people < s.total_people AND
        (:destination IS NULL OR t.destination LIKE CONCAT('%', :destination, '%')) AND
        (:startDate IS NULL OR s.start_date = :startDate) AND
        (:endDate IS NULL OR s.end_date = :endDate)
    GROUP BY t.id, t.name, t.destination, t.quantity_day
    """, nativeQuery = true)
    List<Object[]> findSearchToursByDestination(
        @Param("destination") String destination,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    @Query(value = """
    SELECT t.id, t.name, t.destination,
        (SELECT i.image FROM tour_images i WHERE i.tour_id = t.id LIMIT 1) AS image,
        t.quantity_day,
        MIN(s.adult_price) AS adult_price,
        MIN(s.start_date) AS start_date,
        MAX(s.end_date) AS end_date,
        (
            SELECT IFNULL(SUM(s2.total_people - s2.quantity_people), 0)
            FROM schedule s2
            WHERE s2.tour_id = t.id AND s2.status = 'Chưa diễn ra' AND s2.quantity_people < s2.total_people AND
            (:minPrice IS NULL OR s2.adult_price >= :minPrice) AND
            (:maxPrice IS NULL OR s2.adult_price <= :maxPrice) AND
            (:startDate IS NULL OR s2.start_date >= :startDate) AND
            (:endDate IS NULL OR s2.end_date <= :endDate)
        ) AS people,
        IFNULL(FLOOR((
            SELECT AVG(r2.rating)
            FROM review r2
            WHERE r2.tour_id = t.id
        )), 0) AS rating,
        MAX(s.created_time) AS created_time
    FROM tour t
    INNER JOIN schedule s ON t.id = s.tour_id
    WHERE
        (s.status = 'Chưa diễn ra') AND
        (s.quantity_people < s.total_people) AND
        (:minPrice IS NULL OR s.adult_price >= :minPrice) AND
        (:maxPrice IS NULL OR s.adult_price <= :maxPrice) AND
        (:area IS NULL OR t.area = :area) AND
        (:startDate IS NULL OR s.start_date >= :startDate) AND
        (:endDate IS NULL OR s.end_date <= :endDate) AND
        (:quantityDay IS NULL OR t.quantity_day = :quantityDay)
    GROUP BY t.id, t.name, t.destination, t.quantity_day
    """,
            countQuery = """
    SELECT COUNT(DISTINCT t.id)
    FROM tour t
    INNER JOIN schedule s ON t.id = s.tour_id
    WHERE
        (s.status = 'Chưa diễn ra') AND
        (s.quantity_people < s.total_people) AND
        (:minPrice IS NULL OR s.adult_price >= :minPrice) AND
        (:maxPrice IS NULL OR s.adult_price <= :maxPrice) AND
        (:area IS NULL OR t.area = :area) AND
        (:startDate IS NULL OR s.start_date >= :startDate) AND
        (:endDate IS NULL OR s.end_date <= :endDate) AND
        (:quantityDay IS NULL OR t.quantity_day = :quantityDay)
    GROUP BY t.id
    """,
            nativeQuery = true)
    Page<Object[]> findFilteredToursByArea(
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("area") String area,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("quantityDay") Integer quantityDay,
            Pageable pageable
    );

    long count();

    @Query("SELECT t " +
            "FROM Tour t " +
            "INNER JOIN Schedule s ON t.id = s.tourId " +
            "WHERE t.id <> :id AND s.status = 'Chưa diễn ra' AND s.quantityPeople < s.totalPeople " +
            "ORDER BY t.quantityOrder DESC")
    List<Tour> findAllBySimilar(@Param("id") String id);

    @Query(value = """
    SELECT t.id, t.name, t.destination,
        (SELECT i.image FROM tour_images i WHERE i.tour_id = t.id LIMIT 1) AS image,
        t.quantity_day,
        MIN(s.adult_price) AS adult_price,
        (
            SELECT IFNULL(SUM(s2.total_people - s2.quantity_people), 0)
            FROM schedule s2
            WHERE s2.tour_id = t.id AND s2.status = 'Chưa diễn ra' AND s2.quantity_people < s2.total_people
        ) AS people,
        IFNULL(FLOOR((
            SELECT AVG(r2.rating)
            FROM review r2
            WHERE r2.tour_id = t.id
        )), 0) AS rating,
        MAX(s.created_time) AS created_time
    FROM tour t
    INNER JOIN schedule s ON t.id = s.tour_id
    WHERE
        (s.status = 'Chưa diễn ra') AND
        (s.quantity_people < s.total_people)
    GROUP BY t.id, t.name, t.destination, t.quantity_day
    """,
            nativeQuery = true)
    List<Object[]> findHotTours();

    @Query(value = """
    SELECT t.id, t.name, t.destination,
        (SELECT i.image FROM tour_images i WHERE i.tour_id = t.id LIMIT 1) AS image,
        t.quantity_day,
        MIN(s.adult_price) AS adult_price,
        MIN(s.start_date) AS start_date,
        MAX(s.end_date) AS end_date,
        (
            SELECT IFNULL(SUM(s2.total_people - s2.quantity_people), 0)
            FROM schedule s2
            WHERE s2.tour_id = t.id AND s2.status = 'Chưa diễn ra' AND s2.quantity_people < s2.total_people AND
            (:minPrice IS NULL OR s2.adult_price >= :minPrice) AND
            (:maxPrice IS NULL OR s2.adult_price <= :maxPrice) AND
            (:startDate IS NULL OR s2.start_date >= :startDate) AND
            (:endDate IS NULL OR s2.end_date <= :endDate)
        ) AS people,
        MAX(s.created_time) AS created_time
    FROM tour t
    INNER JOIN schedule s ON t.id = s.tour_id
    WHERE
        (s.status = 'Chưa diễn ra') AND
        (s.quantity_people < s.total_people) AND
        (:minPrice IS NULL OR s.adult_price >= :minPrice) AND
        (:maxPrice IS NULL OR s.adult_price <= :maxPrice) AND
        (:area IS NULL OR t.area = :area) AND
        (:startDate IS NULL OR s.start_date >= :startDate) AND
        (:endDate IS NULL OR s.end_date <= :endDate) AND
        (:quantityDay IS NULL OR t.quantity_day = :quantityDay)
    GROUP BY t.id, t.name, t.destination, t.quantity_day
    """,
            nativeQuery = true)
    List<Object[]> findChatTours(
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("area") String area,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("quantityDay") Integer quantityDay
    );

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.user.TourSummaryResponse(" +
            "t.code, t.name, t.quantityDay) " +
            "FROM Tour t " +
            "WHERE t.id = :id")
    TourSummaryResponse findTourSummaryById(@Param("id") String id);
}