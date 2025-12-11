package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.user.BookingCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.BookingProcessionRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.CheckoutCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.*;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.PopularToursResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.BookingResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.*;
import com.websitesaoviet.WebsiteSaoViet.entity.Booking;
import com.websitesaoviet.WebsiteSaoViet.enums.BookingStatus;
import com.websitesaoviet.WebsiteSaoViet.enums.CheckoutStatus;
import com.websitesaoviet.WebsiteSaoViet.enums.MethodPayment;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.mapper.BookingMapper;
import com.websitesaoviet.WebsiteSaoViet.repository.BookingRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingService {
    BookingRepository bookingRepository;
    BookingMapper bookingMapper;
    CustomerService customerService;
    ScheduleService scheduleService;
    TourService tourService;
    PromotionService promotionService;
    MailService mailService;
    AuthenticationService authenticationService;
    CheckoutService checkoutService;
    RedisService redisService;
    CustomerPromotionService customerPromotionService;
    MomoService momoService;
    VnpayService vnpayService;

    @NonFinal
    @Value("${app.fe-base-url}")
    protected String FE_BASE_URL;

    @NonFinal
    @Value("${app.be-base-url}")
    protected String BE_BASE_URL;

    public BookingResponse createBooking (BookingCreationRequest request) {
        LocalDateTime currentTime = LocalDateTime.now();
        Booking booking = new Booking();

        booking.setCode(request.getCode());
        booking.setCustomerId(request.getCustomerId());
        booking.setCustomerCode(request.getCustomerCode());
        booking.setTourId(request.getTourId());
        booking.setTourCode(request.getTourCode());
        booking.setTourName(request.getTourName());
        booking.setQuantityDay(request.getQuantityDay());
        booking.setScheduleId(request.getScheduleId());
        booking.setScheduleCode(request.getScheduleCode());
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setAdultPrice(request.getAdultPrice());
        booking.setChildrenPrice(request.getChildrenPrice());
        booking.setQuantityAdult(request.getQuantityAdult());
        booking.setQuantityChildren(request.getQuantityChildren());
        booking.setPromotionId(request.getPromotionId());
        booking.setDiscount(request.getDiscount());
        booking.setTotalPrice(request.getTotalPrice());
        booking.setBookingTime(currentTime);
        booking.setExpiredTime(request.getExpiredTime());
        booking.setStatus(BookingStatus.PROCESSING.getValue());
        booking.setReviewed(false);
        booking.setReserved(false);

        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    @Async("taskExecutor")
    public CompletableFuture<ProcessCheckoutResponse> processBooking(String accessToken, BookingProcessionRequest request) {
        try {
            if (request.getQuantityAdult() + request.getQuantityChildren() <= 0) {
                throw new AppException(ErrorCode.QUANTITY_PEOPLE_INVALID);
            }

            String scheduleId = request.getScheduleId().trim();
            String promotionId = request.getPromotionId().trim().isEmpty() ? null : request.getPromotionId().trim();
            String method = request.getMethod().trim().toLowerCase();
            var schedule = scheduleService.getScheduleById(scheduleId);
            int quantityAdult = request.getQuantityAdult();
            int quantityChildren = request.getQuantityChildren();
            int availablePeople = redisService.getAvailablePeople(scheduleId, schedule.getTotalPeople() - schedule.getQuantityPeople());

            if (quantityAdult + quantityChildren > availablePeople) {
                throw new AppException(ErrorCode.SCHEDULE_PEOPLE_INVALID);
            }

            Double adultPrice = schedule.getAdultPrice();
            Double childrenPrice = schedule.getChildrenPrice();
            Double discount = 0.0;
            String customerId = authenticationService.getIdByToken(accessToken);

            if ((method.equals("momo") || method.equals("vnpay")) && (!request.getPromotionId().trim().equals(""))) {
                if (redisService.isPromotionLocked(promotionId, customerId) || customerPromotionService.validCustomerPromotion(customerId, promotionId)) {
                    throw new AppException(ErrorCode.PROMOTION_USED);
                }

                var promotion = promotionService.getAvailablePromotionById(request.getPromotionId());
                if (redisService.getAvailablePromotion(promotionId, promotion.getQuantity()) > 0) {
                    discount = promotion.getDiscount();
                } else {
                    throw new AppException(ErrorCode.PROMOTION_USAGE_LIMIT_EXCEEDED);
                }
            }

            Double amount = adultPrice * request.getQuantityAdult() + childrenPrice * request.getQuantityChildren() - discount;
            Random random = new Random();
            String orderId = System.currentTimeMillis() + "" + random.nextInt(100);
            int responseCode = 0;
            String checkoutUrl = "";
            String tourId = schedule.getTourId();
            var customer = customerService.getCustomerById(customerId);
            var tour = tourService.getTourSummary(tourId);
            LocalDateTime currentTime = LocalDateTime.now();

            var bookingCreation = BookingCreationRequest.builder()
                    .code(orderId)
                    .customerId(customerId)
                    .customerCode(customer.getCode())
                    .tourId(tourId)
                    .tourCode(tour.getCode())
                    .tourName(tour.getName())
                    .scheduleId(scheduleId)
                    .scheduleCode(schedule.getCode())
                    .startDate(schedule.getStartDate())
                    .endDate(schedule.getEndDate())
                    .quantityDay(tour.getQuantityDay())
                    .quantityAdult(quantityAdult)
                    .quantityChildren(quantityChildren)
                    .adultPrice(schedule.getAdultPrice())
                    .childrenPrice(schedule.getChildrenPrice())
                    .promotionId(promotionId)
                    .discount(discount)
                    .totalPrice(amount)
                    .expiredTime(currentTime.plusMinutes(15))
                    .build();

            switch (method) {
                case "momo":
                    responseCode = 1800;
                    checkoutUrl = this.processMomoCheckout(orderId, amount);
                    redisService.setLockPeople(scheduleId, orderId, quantityAdult + quantityChildren);
                    if (promotionId != null) {
                        redisService.setLockPromotion(promotionId, customerId);
                    }
                    var newBookingMomo = this.createBooking(bookingCreation);
                    checkoutService.createCheckout(
                            CheckoutCreationRequest.builder()
                                    .code(null)
                                    .bookingId(newBookingMomo.getId())
                                    .orderId(orderId)
                                    .method(MethodPayment.MOMO.getValue())
                                    .checkoutTime(null)
                                    .status(CheckoutStatus.UNPAID.getValue())
                                    .build()
                    );
                    break;
                case "vnpay":
                    responseCode = 1801;
                    checkoutUrl = this.processVnpayCheckout(orderId, amount);
                    redisService.setLockPeople(scheduleId, orderId, quantityAdult + quantityChildren);
                    if (promotionId != null) {
                        redisService.setLockPromotion(promotionId, customerId);
                    }
                    var newBookingVnpay = this.createBooking(bookingCreation);
                    checkoutService.createCheckout(
                            CheckoutCreationRequest.builder()
                                    .code(null)
                                    .bookingId(newBookingVnpay.getId())
                                    .orderId(orderId)
                                    .method(MethodPayment.VNPAY.getValue())
                                    .checkoutTime(null)
                                    .status(CheckoutStatus.UNPAID.getValue())
                                    .build()
                    );
                    break;
                case "cash":
                    responseCode = 1802;
                    checkoutUrl = this.processCashPayment(bookingCreation);
                    break;
                default:
                    responseCode = 1803;
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
            log.error("Process booking failed: ", e);

            return CompletableFuture.completedFuture(
                    ProcessCheckoutResponse.builder()
                            .responseCode(ErrorCode.UNKNOWN_ERROR.getCode())
                            .message(ErrorCode.UNKNOWN_ERROR.getMessage())
                            .build()
            );
        }
    }

    public String processMomoCheckout(String orderId, Double amount) {
        String redirectUrl = FE_BASE_URL + "/booking/message";
        String ipnUrl = BE_BASE_URL + "/api/v1/payments/momo/callback";
        int amountInt = amount.intValue();

        return momoService.createMomoPayment(orderId, amountInt, redirectUrl, ipnUrl);
    }

    public String processVnpayCheckout(String orderId, Double amount) {
        String redirectUrl = FE_BASE_URL + "/booking/message";
        int amountInt = amount.intValue();

        return vnpayService.createVnpayPayment(orderId, amountInt, redirectUrl);
    }

    private String processCashPayment(BookingCreationRequest request) {
        LocalDate currentDate = LocalDate.now();
        LocalDate startDate = request.getStartDate();
        LocalDateTime currentTime = LocalDateTime.now();
        LocalDateTime nextDay = currentTime.plusDays(1);
        String formattedTime = nextDay.format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));

        if (currentDate.isBefore(startDate.minusDays(2))) {
            var newBooking = this.createBooking(
                    BookingCreationRequest.builder()
                            .code(request.getCode())
                            .customerId(request.getCustomerId())
                            .customerCode(request.getCustomerCode())
                            .tourId(request.getTourId())
                            .tourCode(request.getTourCode())
                            .tourName(request.getTourName())
                            .scheduleId(request.getScheduleId())
                            .scheduleCode(request.getScheduleCode())
                            .startDate(request.getStartDate())
                            .endDate(request.getEndDate())
                            .quantityDay(request.getQuantityDay())
                            .quantityAdult(request.getQuantityAdult())
                            .quantityChildren(request.getQuantityChildren())
                            .adultPrice(request.getAdultPrice())
                            .childrenPrice(request.getChildrenPrice())
                            .promotionId(null)
                            .discount(0.0)
                            .totalPrice(request.getTotalPrice())
                            .expiredTime(nextDay)
                            .build()
            );

            checkoutService.createCheckout(
                    CheckoutCreationRequest.builder()
                            .code(null)
                            .bookingId(newBooking.getId())
                            .orderId(null)
                            .method(MethodPayment.CASH.getValue())
                            .checkoutTime(null)
                            .status(CheckoutStatus.UNPAID.getValue())
                            .build()
            );

            return String.format("Vui lòng thanh toán trước %s!", formattedTime);
        } else {
            throw new AppException(ErrorCode.METHOD_PAYMENT_INVALID);
        }
    }

    public Page<BookingListResponse> getBookings(String keyword, Pageable pageable) {
        return bookingRepository.findAllBookings(keyword, pageable);
    }

    public List<BookingSummaryResponse> getBookingsByCustomerId(String customerId) {
        List<Object[]> rawResult = bookingRepository.findBookingsByCustomerId(customerId);

        return rawResult.stream()
                .map(obj -> new BookingSummaryResponse(
                        (String) obj[0],
                        (String) obj[1],
                        (String) obj[2],
                        (String) obj[3],
                        (String) obj[4],
                        (String) obj[5],
                        ((Number) obj[6]).intValue(),
                        ((Number) obj[7]).intValue(),
                        ((Number) obj[8]).doubleValue(),
                        ((Number) obj[9]).intValue(),
                        ((Timestamp) obj[10]).toLocalDateTime(),
                        obj[11] != null ? ((Timestamp) obj[11]).toLocalDateTime() : null,
                        (String) obj[12],
                        (boolean) obj[13],
                        (String) obj[14]
                        ))
                .collect(Collectors.toList());
    }

    public BookingDetailResponse getBookingDetail(String id, String customerId) {
        if (!bookingRepository.existsByIdAndCustomerId(id, customerId)) {
            throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
        }

        return bookingRepository.findBookingDetail(id);
    }

    public void updateBookingByReview(String id, boolean isReviewed) {
        var booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_EXITED));

        booking.setReviewed(isReviewed);

        bookingRepository.save(booking);
    }

    public void cancelBooking(String id, String customerId) {
        var booking = bookingRepository.findByIdAndCustomerIdAndStatus(id, customerId, BookingStatus.PROCESSING.getValue());

        if (booking == null) {
            throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
        }

        handleCancel(booking);
    }

    public boolean cancelBookingByAdmin(String id) {
        var booking = bookingRepository.findBookingByIdAndStatus(id, BookingStatus.PROCESSING.getValue());

        if (booking == null) {
            throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
        }

        handleCancel(booking);

        if (booking.getExpiredTime() == null) {
            return true;
        } else {
            return false;
        }
    }

    private void handleCancel(Booking booking) {
        try {
            if (booking.isReserved()) {
                int people = booking.getQuantityAdult() + booking.getQuantityChildren();
                scheduleService.minusQuantityPeople(booking.getScheduleId(), people);
            }

            if (booking.getExpiredTime() != null && booking.getExpiredTime().isAfter(LocalDateTime.now())) {
                redisService.removeLockPeople(booking.getScheduleId(), booking.getCode());

                if (booking.getPromotionId() != null && !booking.getPromotionId().isEmpty()) {
                    redisService.removeLockPromotion(booking.getPromotionId(), booking.getCustomerId());
                }
            }

            if (checkoutService.validateCheckoutIsPaidByBookingId(booking.getId())) {
                if (booking.getPromotionId() != null && !booking.getPromotionId().isEmpty()) {
                    promotionService.addQuantity(booking.getPromotionId(), 1);
                    customerPromotionService.deleteByCustomerIdAndPromotionId(booking.getCustomerId(), booking.getPromotionId());
                }

                booking.setStatus(BookingStatus.CANCEL.getValue());
                bookingRepository.save(booking);
            } else {
                bookingRepository.deleteById(booking.getId());
            }
        } catch (AppException ae) {
            throw new AppException(ae.getErrorCode());
        } catch (Exception e) {
            log.error("Cancel booking failed: ", e);
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    public void confirmBooking(String id) {
        try {
            var booking = bookingRepository.findPaidBooking(id);

            if (booking == null) {
                throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
            }

            booking.setStatus(BookingStatus.CONFIRM.getValue());
            booking.setExpiredTime(null);
            booking.setReviewed(true);

            bookingRepository.save(booking);

            tourService.addOrders(booking.getTourId(), 1);
        } catch (AppException ae) {
            throw new AppException(ae.getErrorCode());
        } catch (Exception e) {
            log.error("Confirm booking failed: ", e);
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    public void confirmReserve(String id) {
        try {
            var booking = bookingRepository.findBookingByIdAndStatusAndIsReserved(id, BookingStatus.PROCESSING.getValue(), false);

            if (booking == null) {
                throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
            }

            if (booking.getExpiredTime() != null
                    && booking.getExpiredTime().isBefore(LocalDateTime.now())
                    && checkoutService.existsUnpaidByBookingIdAndMethod(booking.getId(), MethodPayment.CASH.getValue())
            ) {
                throw new AppException(ErrorCode.BOOKING_EXPIRED);
            }

            int quantityPeople = scheduleService.getAvailablePeople(booking.getScheduleId());
            int availablePeople = redisService.getAvailablePeople(booking.getScheduleId(), quantityPeople);

            if (booking.getQuantityAdult() + booking.getQuantityChildren() > availablePeople) {
                throw new AppException(ErrorCode.SCHEDULE_PEOPLE_INVALID);
            }

            booking.setReserved(true);
            bookingRepository.save(booking);
            scheduleService.addQuantityPeople(booking.getScheduleId(), quantityPeople);
        } catch (AppException ae) {
            throw new AppException(ae.getErrorCode());
        } catch (Exception e) {
            log.error("Confirm reserve failed: ", e);
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    public RetryPaymentResponse getUnpaidBooking(String id, String customerId) {
        var booking = bookingRepository.findUnpaidBooking(id, customerId);

        if (booking == null) {
            throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
        }

        return booking;
    }

    public boolean canReserve(String id) {
        return bookingRepository.existsByIdAndStatusAndIsReserved(id, BookingStatus.PROCESSING.getValue(), false);
    }

    public LocalDateTime getExpiredTimeById(String id) {
        return bookingRepository.findExpiredTimeById(id);
    }

    public long getCountBookings() {
        return bookingRepository.countBookings();
    }

    public long getTotalRevenue() {
        return bookingRepository.totalRevenue();
    }

    public List<BookingsLatestResponse> getBookingsLatest() {
        Pageable pageable = PageRequest.of(0, 10);
        return bookingRepository.findBookingsLatest(pageable);
    }

    public boolean existsByCustomerId(String customerId) {
        return bookingRepository.existsByCustomerId(customerId);
    }

    public boolean existsByScheduleId(String scheduleId) {
        return bookingRepository.existsByScheduleId(scheduleId);
    }

    public boolean existsByTourId(String tourId) {
        return bookingRepository.existsByTourId(tourId);
    }

    public Booking getBookingReviewValid(String id, String customerId, boolean isReviewed) {
        return bookingRepository.findBookingByIdAndCustomerIdAndIsReviewed(id, customerId, isReviewed);
    }

    public List<PopularToursResponse> getTopPopularTours() {
        LocalDate currentDate = LocalDate.now();
        Pageable pageable = PageRequest.of(0, 10);

        return bookingRepository.findTopPopularToursThisMonth(currentDate, pageable);
    }

    public BookingStatusCountsResponse getStatusCounts() {
        return bookingRepository.findStatusCounts();
    }

    public List<BookingStatisticResponse> getBookingStatisticByYear(Integer year) {
        if (year == null || year <= 0) {
            year = LocalDate.now().getYear();
        }

        return bookingRepository.findBookingStatisticByYear(year);
    }

    public BookingCheckoutDetailResponse getBookingCheckoutDetail(String id) {
        if (!bookingRepository.existsById(id)) {
            throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
        }

        return bookingRepository.findBookingCheckoutDetail(id);
    }

    public BookingCheckoutResponse getBookingCheckout(String id) {
        if (!bookingRepository.existsById(id)) {
            throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
        }

        return bookingRepository.findBookingCheckoutById(id);
    }

    public int getPaymentPendingCount(String customerId) {
        Integer count = bookingRepository.findPaymentPendingCount(customerId, LocalDateTime.now());

        if (count == null) {
            return 0;
        }

        return count;
    }

    public boolean sendInvoice(String bookingId, boolean isConfirm) {
        try {
            var invoice = getBookingCheckoutDetail(bookingId);
            String subject = String.format("Thông tin lịch đặt #%s", invoice.getCode());

            mailService.sendInvoice(invoice, subject, isConfirm);

            return true;
        } catch (Exception e) {
            log.error("Send invoice failed: ", e);
            return false;
        }
    }

    public void markAsReserved(String id) {
        bookingRepository.markAsReserved(id);
    }

    public void markAsExpiredTime(String id) {
        bookingRepository.markAsExpiredTime(id);
    }

    @Transactional
    public void deleteBooking(String id) {
        if(!bookingRepository.existsById(id)) {
            throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
        }

        bookingRepository.deleteById(id);
    }
}