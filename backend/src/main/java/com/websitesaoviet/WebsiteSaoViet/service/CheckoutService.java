package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.user.CheckoutProcessionRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.CheckoutResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Checkout;
import com.websitesaoviet.WebsiteSaoViet.enums.CheckoutStatus;
import com.websitesaoviet.WebsiteSaoViet.enums.MethodPayment;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.mapper.CheckoutMapper;
import com.websitesaoviet.WebsiteSaoViet.repository.CheckoutRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutService {
    CheckoutMapper checkoutMapper;
    CheckoutRepository checkoutRepository;
    ScheduleService scheduleService;
    MomoService momoService;
    VnpayService vnpayService;
    PromotionService promotionService;
    BookingService bookingService;

    @NonFinal
    @Value("${base.url}")
    protected String BASE_URL;

    public CheckoutResponse createCheckout(String bookingId, String checkoutCode, String method,
                                           LocalDateTime currentTime, String status) {

        Checkout checkout = new Checkout();

        checkout.setCode(checkoutCode);
        checkout.setBookingId(bookingId);
        checkout.setMethod(method);
        checkout.setCheckoutTime(currentTime);
        checkout.setStatus(status);

        return checkoutMapper.toCheckoutResponse(checkoutRepository.save(checkout));
    }

    public String processMomoCheckout(String orderId, String customerId, Double amount, CheckoutProcessionRequest request) {
        String redirectUrl = BASE_URL + "/booking/message";
        String ipnUrl = BASE_URL + "/booking/message";
        String promotionId = request.getPromotionId().trim();

        String extraData = "scheduleId=" + request.getScheduleId() + ";customerId=" + customerId + ";quantityAdult=" + request.getQuantityAdult() + ";quantityChildren=" + request.getQuantityChildren() + ";promotionId=" + promotionId;
        int amountInt = amount.intValue();

        return momoService.createPayment(amountInt, orderId, redirectUrl, ipnUrl, extraData);
    }

    public String processVnpayCheckout(String orderId, String customerId, Double amount, CheckoutProcessionRequest request) {
        String redirectUrl = "http://localhost:3000/booking/message";
        String promotionId = request.getPromotionId().trim();

        String extraData = "scheduleId=" + request.getScheduleId() + ";customerId=" + customerId + ";quantityAdult=" + request.getQuantityAdult() + ";quantityChildren=" + request.getQuantityChildren() + ";promotionId=" + promotionId;
        int amountInt = amount.intValue();

        return vnpayService.createPayment(amountInt, orderId, redirectUrl, extraData);
    }

    public boolean resultMomoCheckout(@RequestParam Map<String, String> params) {
        if (!momoService.verifySignature(params)) {
            throw new AppException(ErrorCode.SIGNATURE_INVALID);
        }

        String bookingCode = params.getOrDefault("orderId", "");
        String checkoutCode = params.getOrDefault("transId", "");

        if (bookingCode.isEmpty() || checkoutCode.isEmpty()) {
            throw new AppException(ErrorCode.DATA_INVALID);
        }

        if (checkoutRepository.existsCheckoutByCode(checkoutCode)) {
            throw new AppException(ErrorCode.CHECKOUT_EXITED);
        }

        try {
            int resultCode = Integer.parseInt(params.getOrDefault("resultCode", "-1"));

            if (resultCode == 0) {
                String extraData = params.getOrDefault("extraData", "");
                String[] extraParams = extraData.split(";");

                String scheduleId = (extraParams.length > 0 && extraParams[0].contains("=")) ? extraParams[0].split("=", 2)[1] : "";
                String customerId = (extraParams.length > 1 && extraParams[1].contains("=")) ? extraParams[1].split("=", 2)[1] : "";
                int quantityAdult = (extraParams.length > 2 && extraParams[2].contains("=")) ? Integer.parseInt(extraParams[2].split("=", 2)[1]) : 0;
                int quantityChildren = (extraParams.length > 3 && extraParams[3].contains("=")) ? Integer.parseInt(extraParams[3].split("=", 2)[1]) : 0;
                String promotionId = (extraParams.length > 4 && extraParams[4].contains("=")) ? extraParams[4].split("=", 2)[1] : "";

                Double amount = Double.parseDouble(params.getOrDefault("amount", "0"));

                String method = MethodPayment.MOMO.getValue();
                LocalDateTime currentTime = LocalDateTime.now();
                String status = CheckoutStatus.PAID.getValue();
                int people = quantityAdult + quantityChildren;
                Double discount = 0.0;

                if (!promotionId.trim().equals("")) {
                    var promotion = promotionService.getPromotionById(promotionId);

                    discount = promotion.getDiscount();
                    promotionService.minusQuantity(promotionId, 1);
                }

                var newBooking = bookingService.createBooking(bookingCode, customerId, scheduleId, quantityAdult, quantityChildren, amount, promotionId, discount, true);

                createCheckout(newBooking.getId(), checkoutCode, method, currentTime, status);

                scheduleService.addQuantityPeople(scheduleId, people);

                return true;
            }

            return false;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    public boolean resultVnpayCheckout(Map<String, String> params) {
        if (!vnpayService.verifySignature(params)) {
            throw new AppException(ErrorCode.SIGNATURE_INVALID);
        }

        String bookingCode = params.get("vnp_TxnRef");
        String checkoutCode = params.get("vnp_TransactionNo");

        if (bookingCode.isEmpty() || checkoutCode.isEmpty()) {
            throw new AppException(ErrorCode.DATA_INVALID);
        }

        if (checkoutRepository.existsCheckoutByCode(checkoutCode)) {
            throw new AppException(ErrorCode.CHECKOUT_EXITED);
        }

        try {
            String vnp_ResponseCode = params.get("vnp_ResponseCode");

            if ("00".equals(vnp_ResponseCode)) {
                String vnp_OrderInfo = params.get("vnp_OrderInfo");
                String vnp_Amount = params.get("vnp_Amount");

                String[] orderInfoParts = vnp_OrderInfo.split(";");

                Map<String, String> extraData = new HashMap<>();
                for (int i = 1; i < orderInfoParts.length; i++) {
                    String[] kv = orderInfoParts[i].split("=");
                    if (kv.length == 2) {
                        extraData.put(kv[0], kv[1]);
                    }
                }

                String scheduleId = extraData.getOrDefault("scheduleId", "");
                String customerId = extraData.getOrDefault("customerId", "");
                int quantityAdult = Integer.parseInt(extraData.getOrDefault("quantityAdult", "0"));
                int quantityChildren = Integer.parseInt(extraData.getOrDefault("quantityChildren", "0"));
                String promotionId = extraData.getOrDefault("promotionId", "");

                Double amount = Double.parseDouble(vnp_Amount) / 100;

                String method = MethodPayment.VNPAY.getValue();
                LocalDateTime currentTime = LocalDateTime.now();
                String status = CheckoutStatus.PAID.getValue();
                int people = quantityAdult + quantityChildren;
                Double discount = 0.0;

                if (!promotionId.trim().equals("")) {
                    var promotion = promotionService.getPromotionById(promotionId);

                    discount = promotion.getDiscount();
                    promotionService.minusQuantity(promotionId, 1);
                }

                var newBooking = bookingService.createBooking(bookingCode, customerId, scheduleId, quantityAdult, quantityChildren, amount, promotionId, discount, true);

                createCheckout(newBooking.getId(), checkoutCode, method, currentTime, status);

                scheduleService.addQuantityPeople(scheduleId, people);

                return true;
            }

            return false;
        } catch (Exception e) {
           throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    public String resultCashCheckout(String bookingCode, String customerId, Double amount, CheckoutProcessionRequest request) {
        LocalDate currentDate = LocalDate.now();
        String scheduleId = request.getScheduleId();
        var schedule = scheduleService.getScheduleById(scheduleId);
        LocalDate startDate = schedule.getStartDate();

        if (currentDate.isBefore(startDate.minusDays(2))) {
            LocalDateTime currentTime = LocalDateTime.now();
            int quantityAdult = request.getQuantityAdult();
            int quantityChildren = request.getQuantityChildren();
            String method = MethodPayment.CASH.getValue();
            String status = CheckoutStatus.UNPAID.getValue();
            Double discount = 0.0;

            var newBooking = bookingService.createBooking(bookingCode, customerId, scheduleId, quantityAdult, quantityChildren, amount, "", discount, false);

            createCheckout(newBooking.getId(), "", method, null, status);

            LocalDateTime nextDay = currentTime.plusDays(1);
            String formattedTime = nextDay.format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));

            return String.format("Vui lòng đến quầy thanh toán trước %s!", formattedTime);
        } else {
            throw new AppException(ErrorCode.METHOD_PAYMENT_INVALID);
        }
    }

    public void confirmCheckout(String id) {
        var checkoutValid = checkoutRepository.findCheckoutValidById(id);

        if (checkoutValid == null) {
            throw new AppException(ErrorCode.CHECKOUT_NOT_EXITED);
        }

        if (!checkoutValid.isReserved()) {
            bookingService.confirmReserve(checkoutValid.getBookingId());
        }

        var checkout = checkoutRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.CHECKOUT_NOT_EXITED));

        checkout.setCheckoutTime(LocalDateTime.now());
        checkout.setStatus(CheckoutStatus.PAID.getValue());

        checkoutRepository.save(checkout);
    }
}