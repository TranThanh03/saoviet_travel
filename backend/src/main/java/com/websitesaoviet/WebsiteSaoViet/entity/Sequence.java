package com.websitesaoviet.WebsiteSaoViet.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(
        name = "sequence",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"type", "year"})
        }
)

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Sequence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true)
    Long id;

    @Column(name = "type")
    String type;

    @Column(name = "year")
    int year;

    @Column(name = "last_number")
    int lastNumber;
}