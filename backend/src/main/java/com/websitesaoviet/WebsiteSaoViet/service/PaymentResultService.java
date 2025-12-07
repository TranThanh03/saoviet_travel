package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.user.RetryPaymentRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ProcessCheckoutResponse;
import com.websitesaoviet.WebsiteSaoViet.enums.CheckoutStatus;
import com.websitesaoviet.WebsiteSaoViet.enums.MethodPayment;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentResultService {
    CheckoutService checkoutService;
    ScheduleService scheduleService;
    MomoService momoService;
    VnpayService vnpayService;
    PromotionService promotionService;
    BookingService bookingService;
    CustomerPromotionService customerPromotionService;
    RedisService redisService;
    AuthenticationService authenticationService;

    public void resultMomoPayment(Map<String, String> params) {
        try {
            if (!momoService.verifySignature(params)) {
                throw new AppException(ErrorCode.SIGNATURE_INVALID);
            }

            String orderId = params.getOrDefault("orderId", "");
            String checkoutCode = params.getOrDefault("transId", "");
            Double amount = Double.parseDouble(params.getOrDefault("amount", "0"));

            if (orderId.isEmpty() || checkoutCode.isEmpty() || amount == 0.0) {
                throw new AppException(ErrorCode.DATA_INVALID);
            }

            var checkout = checkoutService.getUnpaidCheckoutByOrderId(orderId);
            var booking = bookingService.getBookingCheckout(checkout.getBookingId());
            String promotionId = booking.getPromotionId();
            String customerId = booking.getCustomerId();
            int resultCode = Integer.parseInt(params.getOrDefault("resultCode", "-1"));

            if (resultCode == 0) {
                if (Math.abs(booking.getTotalPrice() - amount) > 0.001) {
                    throw new AppException(ErrorCode.AMOUNT_INVALID);
                }

                LocalDateTime currentTime = LocalDateTime.now();
                int people = booking.getQuantityAdult() + booking.getQuantityChildren();

                checkout.setCode(checkoutCode);
                checkout.setCheckoutTime(currentTime);
                checkout.setStatus(CheckoutStatus.PAID.getValue());
                checkout.setMethod(MethodPayment.MOMO.getValue());

                checkoutService.saveCheckout(checkout);
                bookingService.markAsReserved(checkout.getBookingId());
                scheduleService.addQuantityPeople(booking.getScheduleId(), people);
                redisService.removeLockPeople(booking.getScheduleId(), booking.getCode());

                if (promotionId != null) {
                    promotionService.minusQuantity(promotionId, 1);
                    customerPromotionService.createCustomerPromotion(customerId, promotionId);
                    redisService.removeLockPromotion(promotionId, customerId);
                }
            } else {
                checkoutService.deleteCheckout(checkout.getId());
                bookingService.deleteBooking(checkout.getBookingId());
                redisService.removeLockPeople(booking.getScheduleId(), booking.getCode());
                if (promotionId != null) {
                    redisService.removeLockPromotion(promotionId, customerId);
                }
            }
        } catch (AppException ae) {
            throw new AppException(ae.getErrorCode());
        } catch (Exception e) {
            log.error("Result MOMO payment failed: ", e);
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    public void resultVnpayPayment(Map<String, String> params) {
        try {
            if (!vnpayService.verifySignature(params)) {
                throw new AppException(ErrorCode.SIGNATURE_INVALID);
            }

            String orderId = params.get("vnp_TxnRef");
            String checkoutCode = params.get("vnp_TransactionNo");
            String vnp_Amount = params.get("vnp_Amount");

            if (orderId.isEmpty() || checkoutCode.isEmpty() || vnp_Amount.isEmpty()) {
                throw new AppException(ErrorCode.DATA_INVALID);
            }

            var checkout = checkoutService.getUnpaidCheckoutByOrderId(orderId);
            var booking = bookingService.getBookingCheckout(checkout.getBookingId());
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String promotionId = booking.getPromotionId();
            String customerId = booking.getCustomerId();

            redisService.removeLockPeople(booking.getScheduleId(), booking.getCode());
            if (promotionId != null) {
                redisService.removeLockPromotion(promotionId, customerId);
            }

            if ("00".equals(vnp_ResponseCode)) {
                Double amount = Double.parseDouble(vnp_Amount) / 100;
                if (Math.abs(booking.getTotalPrice() - amount) > 0.001) {
                    throw new AppException(ErrorCode.AMOUNT_INVALID);
                }

                LocalDateTime currentTime = LocalDateTime.now();
                int people = booking.getQuantityAdult() + booking.getQuantityChildren();

                checkout.setCode(checkoutCode);
                checkout.setCheckoutTime(currentTime);
                checkout.setStatus(CheckoutStatus.PAID.getValue());
                checkout.setMethod(MethodPayment.VNPAY.getValue());

                checkoutService.saveCheckout(checkout);
                bookingService.markAsReserved(checkout.getBookingId());
                scheduleService.addQuantityPeople(booking.getScheduleId(), people);
                redisService.removeLockPeople(booking.getScheduleId(), booking.getCode());

                if (promotionId != null) {
                    promotionService.minusQuantity(promotionId, 1);
                    customerPromotionService.createCustomerPromotion(customerId, promotionId);
                    redisService.removeLockPromotion(promotionId, customerId);
                }
            } else {
                checkoutService.deleteCheckout(checkout.getId());
                bookingService.deleteBooking(checkout.getBookingId());
                redisService.removeLockPeople(booking.getScheduleId(), booking.getCode());
                if (promotionId != null) {
                    redisService.removeLockPromotion(promotionId, customerId);
                }
            }
        } catch (AppException ae) {
            throw new AppException(ae.getErrorCode());
        } catch (Exception e) {
            log.error("Result VNPAY payment failed: ", e);
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    public void validatePayment(String checkoutCode, String customerId) {
        checkoutService.validateCheckoutIsPaid(checkoutCode, customerId);
    }

    public void confirmPayment(String id, String code) {
        try {
            var checkout = checkoutService.getUnpaidCheckoutById(id);

            if (bookingService.canReserve(checkout.getBookingId())) {
                throw new AppException(ErrorCode.BOOKING_CAN_RESERVE);
            }

            if (checkout.getMethod().equals(MethodPayment.CASH.getValue())) {
                var expiredTime = bookingService.getExpiredTimeById(checkout.getBookingId());

                if (expiredTime != null && expiredTime.isBefore(LocalDateTime.now())) {
                    throw new AppException(ErrorCode.BOOKING_EXPIRED);
                }
            }

            if (!checkout.getMethod().equals(MethodPayment.CASH.getValue())) {
                if (code != null && code.matches("\\d+") && !checkoutService.existsByCode(code)) {
                    checkout.setCode(code);
                } else {
                    throw new AppException(ErrorCode.INVALID_CHECKOUT_CODE);
                }
            }

            checkout.setCheckoutTime(LocalDateTime.now());
            checkout.setStatus(CheckoutStatus.PAID.getValue());

            checkoutService.saveCheckout(checkout);
            bookingService.markAsExpiredTime(checkout.getBookingId());
        } catch (AppException ae) {
            throw new AppException(ae.getErrorCode());
        } catch (Exception e) {
            log.error("Confirm payment failed: ", e.getMessage());
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    @Async("taskExecutor")
    public CompletableFuture<ProcessCheckoutResponse> retryPayment(String accessToken, RetryPaymentRequest request) {
        try {
            String customerId = authenticationService.getIdByToken(accessToken);
            String bookingId = request.getBookingId().trim();
            String method = request.getMethod().trim().toLowerCase();
            var booking = bookingService.getUnpaidBooking(bookingId, customerId);

            if (booking.getExpiredTime() != null && booking.getExpiredTime().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.BOOKING_EXPIRED);
            }

            Random random = new Random();
            String orderId = System.currentTimeMillis() + "" + random.nextInt(100);
            Double amount = booking.getTotalPrice();
            int responseCode;
            String checkoutUrl = "";

            switch (method) {
                case "momo":
                    responseCode = 2304;
                    checkoutUrl = bookingService.processMomoCheckout(orderId, amount);
                    checkoutService.markAsOrderId(bookingId, orderId);
                    break;
                case "vnpay":
                    responseCode = 2305;
                    checkoutUrl = bookingService.processVnpayCheckout(orderId, amount);
                    checkoutService.markAsOrderId(bookingId, orderId);
                    break;
                default:
                    responseCode = 2306;
                    break;
            }

            return CompletableFuture.completedFuture(
                    ProcessCheckoutResponse.builder()
                            .responseCode(responseCode)
                            .checkoutUrl(checkoutUrl)
                            .build()
            );
        } catch (AppException ae) {
            return CompletableFuture.completedFuture(
                    ProcessCheckoutResponse.builder()
                            .responseCode(ae.getErrorCode().getCode())
                            .message(ae.getErrorCode().getMessage())
                            .build()
            );
        } catch (Exception e) {
            log.error("Retry payment failed: ", e);

            return CompletableFuture.completedFuture(
                    ProcessCheckoutResponse.builder()
                            .responseCode(ErrorCode.UNKNOWN_ERROR.getCode())
                            .message(ErrorCode.UNKNOWN_ERROR.getMessage())
                            .build()
            );
        }
    }
}
