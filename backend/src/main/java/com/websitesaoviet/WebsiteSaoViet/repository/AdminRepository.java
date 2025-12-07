package com.websitesaoviet.WebsiteSaoViet.repository;

import com.websitesaoviet.WebsiteSaoViet.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, String> {
    boolean existsAdminByPhone(String phone);
    boolean existsAdminByEmail(String email);
    Optional<Admin> findAdminByPhone(String phone);
    Optional<Admin> findAdminByEmail(String email);

    @Query("SELECT a.id " +
            "FROM Admin a " +
            "WHERE a.email = :email")
    Optional<String> findAdminIdByEmail(String email);

    @Transactional
    @Modifying
    @Query("UPDATE Admin a SET a.password = :newPassword WHERE a.id = :id")
    int updatePassword(
            @Param("id") String id,
            @Param("newPassword") String newPassword
    );
}