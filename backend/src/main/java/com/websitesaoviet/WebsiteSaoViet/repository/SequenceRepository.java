package com.websitesaoviet.WebsiteSaoViet.repository;

import com.websitesaoviet.WebsiteSaoViet.entity.Sequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SequenceRepository extends JpaRepository<Sequence, Long> {
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        INSERT INTO sequence(type, year, last_number)
        VALUES (:type, :year, 1)
        ON DUPLICATE KEY UPDATE
            last_number = last_number + 1
        """, nativeQuery = true)
    void upsert(@Param("type") String type, @Param("year") int year);

    @Query("""
        SELECT s.lastNumber
        FROM Sequence s
        WHERE s.type = :type AND s.year = :year
        """)
    int getLastNumber(@Param("type") String type, @Param("year") int year);
}