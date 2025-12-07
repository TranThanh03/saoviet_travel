package com.websitesaoviet.WebsiteSaoViet.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking")

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", unique = true)
    String id;

    @Column(name = "code", unique = true)
    String code;

    @Column(name = "customer_id")
    String customerId;

    @Column(name = "customer_code")
    String customerCode;

    @Column(name = "tour_id")
    String tourId;

    @Column(name = "tour_code")
    String tourCode;

    @Column(name = "tour_name")
    String tourName;

    @Column(name = "schedule_id")
    String scheduleId;

    @Column(name = "schedule_code")
    String scheduleCode;

    @Column(name = "start_date")
    LocalDate startDate;

    @Column(name = "end_date")
    LocalDate endDate;

    @Column(name = "quantity_day")
    int quantityDay;

    @Column(name = "quantity_adult")
    int quantityAdult;

    @Column(name = "quantity_children")
    int quantityChildren;

    @Column(name = "adult_price")
    Double adultPrice;

    @Column(name = "children_price")
    Double childrenPrice;

    @Column(name = "promotion_id")
    String promotionId;

    @Column(name = "discount")
    Double discount;

    @Column(name = "total_price")
    Double totalPrice;

    @Column(name = "booking_time")
    LocalDateTime bookingTime;

    @Column(name = "expired_time")
    LocalDateTime expiredTime;

    @Column(name = "status")
    String status;

    @Column(name = "is_reviewed")
    boolean isReviewed;

    @Column(name = "is_reserved")
    boolean isReserved;
}