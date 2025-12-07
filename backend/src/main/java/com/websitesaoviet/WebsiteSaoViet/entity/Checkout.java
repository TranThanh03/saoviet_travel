package com.websitesaoviet.WebsiteSaoViet.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "checkout")

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Checkout {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", unique = true)
    String id;

    @Column(name = "code")
    String code;

    @Column(name = "booking_id")
    String bookingId;

    @Column(name = "order_id")
    String orderId;

    @Column(name = "method")
    String method;

    @Column(name = "checkout_time")
    LocalDateTime checkoutTime;

    @Column(name = "status")
    String status;
}