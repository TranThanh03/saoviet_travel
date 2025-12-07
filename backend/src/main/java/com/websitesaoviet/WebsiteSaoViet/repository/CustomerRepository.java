package com.websitesaoviet.WebsiteSaoViet.repository;

import com.websitesaoviet.WebsiteSaoViet.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    boolean existsCustomerByPhone(String phone);

    boolean existsCustomerByEmail(String email);

    Optional<Customer> findCustomerByPhone(String phone);

    Optional<Customer> findCustomerByEmail(String email);

    Optional<Customer> findByIdAndStatus(String id, String status);

    long count();

    boolean existsCustomerByIdAndStatus(String id, String status);

    @Query("SELECT c.id " +
            "FROM Customer c " +
            "WHERE c.email = :email AND c.status = :status")
    Optional<String> findActivationByEmail(String email, String status);

    @Transactional
    @Modifying
    @Query("UPDATE Customer c SET c.password = :newPassword WHERE c.id = :id AND c.status = :status")
    int updatePassword(
            @Param("id") String id,
            @Param("newPassword") String newPassword,
            @Param("status") String status
    );
}