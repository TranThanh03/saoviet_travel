package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.user.CheckoutCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.CheckoutResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Checkout;
import com.websitesaoviet.WebsiteSaoViet.enums.CheckoutStatus;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.mapper.CheckoutMapper;
import com.websitesaoviet.WebsiteSaoViet.repository.CheckoutRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutService {
    CheckoutMapper checkoutMapper;
    CheckoutRepository checkoutRepository;

    public CheckoutResponse createCheckout(CheckoutCreationRequest request) {
        Checkout checkout = new Checkout();

        checkout.setCode(request.getCode());
        checkout.setBookingId(request.getBookingId());
        checkout.setOrderId(request.getOrderId());
        checkout.setMethod(request.getMethod());
        checkout.setCheckoutTime(request.getCheckoutTime());
        checkout.setStatus(request.getStatus());

        return checkoutMapper.toCheckoutResponse(checkoutRepository.save(checkout));
    }

    public Checkout getUnpaidCheckoutByOrderId(String orderId) {
        var checkout = checkoutRepository.findUnpaidCheckoutByOrderId(orderId);

        if (checkout == null) {
            throw new AppException(ErrorCode.CHECKOUT_EXITED);
        }

        return checkout;
    }

    public Checkout getUnpaidCheckoutById(String id) {
        var checkout = checkoutRepository.findUnpaidCheckoutById(id);

        if (checkout == null) {
            throw new AppException(ErrorCode.CHECKOUT_NOT_EXITED);
        }

        return checkout;
    }

    public void validateCheckoutIsPaid(String code, String customerId) {
        if (!checkoutRepository.validateCheckoutIsPaid(code, customerId)) {
            throw new AppException(ErrorCode.CHECKOUT_NOT_EXITED);
        }
    }

    public boolean validateCheckoutIsPaidByBookingId(String bookingId) {
        return checkoutRepository.validateCheckoutIsPaidByBookingId(bookingId);
    }

    public boolean existsByCode(String code) {
        return checkoutRepository.existsByCode(code);
    }

    public boolean existsUnpaidByBookingIdAndMethod(String bookingId, String method) {
        return checkoutRepository.existsByBookingIdAndMethodAndStatus(bookingId, method, CheckoutStatus.UNPAID.getValue());
    }

    public void markAsOrderId(String bookingId, String orderId) {
        checkoutRepository.markAsOrderId(bookingId, orderId);
    }

    @Transactional
    public void deleteCheckout(String id) {
        if(!checkoutRepository.existsById(id)) {
            throw new AppException(ErrorCode.CHECKOUT_NOT_EXITED);
        }

        checkoutRepository.deleteById(id);
    }

    public void saveCheckout(Checkout checkout) {
        checkoutRepository.save(checkout);
    }
}
