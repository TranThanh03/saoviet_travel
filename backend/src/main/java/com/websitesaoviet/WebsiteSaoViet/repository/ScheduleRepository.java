package com.websitesaoviet.WebsiteSaoViet.repository;

import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ScheduleListResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ScheduleStartDateResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ScheduleSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ScheduleTourResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Schedule;
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
public interface ScheduleRepository extends JpaRepository<Schedule, String> {
    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.user.ScheduleSummaryResponse(" +
            "s.id, s.startDate, s.endDate, s.adultPrice, s.childrenPrice, s.totalPeople - s.quantityPeople) " +
            "FROM Schedule s " +
            "WHERE s.tourId = :tourId AND s.status = 'Chưa diễn ra' AND s.quantityPeople < s.totalPeople " +
            "ORDER BY s.startDate ASC")
    List<ScheduleSummaryResponse> findSchedulesByTourId(@Param("tourId") String tourId);

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.user.ScheduleTourResponse(" +
            "t.code, t.name, s.startDate, s.endDate, t.quantityDay, s.totalPeople - s.quantityPeople, s.adultPrice, s.childrenPrice) " +
            "FROM Schedule s " +
            "INNER JOIN Tour t on s.tourId = t.id " +
            "WHERE s.id = :id AND s.status = 'Chưa diễn ra' AND s.quantityPeople < s.totalPeople")
    ScheduleTourResponse findScheduleTourById(@Param("id") String id);

    boolean existsByIdAndStatus(String id, String status);

    boolean existsScheduleByTourIdAndStatus(String tourId, String status);

    @Transactional
    @Modifying
    void deleteAllByTourId(String tourId);

    @Query("SELECT s.totalPeople - s.quantityPeople FROM Schedule s WHERE s.id = :id AND s.status = 'Chưa diễn ra' AND s.quantityPeople <= s.totalPeople")
    Integer getAvailablePeople(@Param("id") String id);

    @Transactional
    @Modifying
    @Query("UPDATE Schedule s SET s.quantityPeople = s.quantityPeople + :people WHERE s.id = :id")
    void addQuantityPeople(@Param("id") String id, @Param("people") int people);

    @Transactional
    @Modifying
    @Query("UPDATE Schedule s SET s.quantityPeople = s.quantityPeople - :people WHERE s.id = :id")
    void minusQuantityPeople(@Param("id") String id, @Param("people") int people);

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ScheduleListResponse(" +
            "s.id, s.code, t.code, s.startDate, s.endDate, s.quantityPeople, s.totalPeople, s.adultPrice, s.childrenPrice, s.status) " +
            "FROM Schedule s " +
            "LEFT JOIN Tour t ON s.tourId = t.id " +
            "WHERE " +
            "(:keywordText IS NULL OR " +
            "  UPPER(s.code) LIKE CONCAT('%', UPPER(:keywordText), '%') OR " +
            "  UPPER(t.code) LIKE CONCAT('%', UPPER(:keywordText), '%')) " +
            "AND (:keywordDate IS NULL OR s.startDate = :keywordDate) " +
            "ORDER BY " +
            "CASE " +
            "   WHEN s.status = 'Chưa diễn ra' THEN 0 " +
            "   WHEN s.status = 'Đang diễn ra' THEN 1 " +
            "   WHEN s.status = 'Đã kết thúc' THEN 2 " +
            "   ELSE 3 " +
            "END, s.createdTime DESC")
    Page<ScheduleListResponse> findAllSchedules(@Param("keywordText") String keywordText,
                                                @Param("keywordDate") LocalDate keywordDate,
                                                Pageable pageable);

    boolean existsScheduleByTourIdAndStartDate(String tourId, LocalDate startDate);

    @Query("SELECT s " +
            "FROM Schedule s " +
            "WHERE s.id = :id AND s.status = 'Chưa diễn ra' AND s.quantityPeople <= :totalPeople")
    Schedule findScheduleValidById(@Param("id") String id, @Param("totalPeople") int totalPeople);

    @Query("SELECT COUNT(s) > 0 " +
            "FROM Schedule s " +
            "LEFT JOIN Booking b ON s.id = b.scheduleId " +
            "WHERE s.id = :id AND s.status = 'Chưa diễn ra' AND b.status = 'Đã xác nhận'")
    boolean existsScheduleByScheduleId(@Param("id") String id);

    @Query("SELECT new com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ScheduleStartDateResponse(" +
            "s.startDate) " +
            "FROM Schedule s " +
            "WHERE s.tourId = :tourId AND s.status = 'Chưa diễn ra'")
    List<ScheduleStartDateResponse> findStartDateByTourId(@Param("tourId") String tourId);
}