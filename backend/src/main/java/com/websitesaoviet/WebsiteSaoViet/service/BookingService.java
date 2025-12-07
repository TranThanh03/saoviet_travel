package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.EmailInvoiceRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.*;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.BookingResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.BookingDetailResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.BookingSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Booking;
import com.websitesaoviet.WebsiteSaoViet.enums.BookingStatus;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.mapper.BookingMapper;
import com.websitesaoviet.WebsiteSaoViet.repository.BookingRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingService {
    BookingRepository bookingRepository;
    BookingMapper bookingMapper;
    CustomerService customerService;
    ScheduleService scheduleService;
    TourService tourService;
    PromotionService promotionService;
    MailService mailService;

    public BookingResponse createBooking (String bookingCode, String customerId, String scheduleId,
                                          int quantityAdult, int quantityChildren,
                                          Double amount, String promotionId, Double discount, boolean isReserved) {
        Booking booking = new Booking();
        var customer = customerService.getCustomerById(customerId);
        var schedule = scheduleService.getScheduleById(scheduleId);
        var tour = tourService.getTourDetail(schedule.getTourId());
        LocalDateTime currentTime = LocalDateTime.now();

        booking.setCode(bookingCode);

        booking.setCustomerId(customerId);
        booking.setCustomerCode(customer.getCode());

        booking.setTourId(schedule.getTourId());
        booking.setTourCode(tour.getCode());
        booking.setTourName(tour.getName());
        booking.setQuantityDay(tour.getQuantityDay());

        booking.setScheduleId(scheduleId);
        booking.setScheduleCode(schedule.getCode());
        booking.setStartDate(schedule.getStartDate());
        booking.setEndDate(schedule.getEndDate());
        booking.setAdultPrice(schedule.getAdultPrice());
        booking.setChildrenPrice(schedule.getChildrenPrice());

        booking.setQuantityAdult(quantityAdult);
        booking.setQuantityChildren(quantityChildren);
        booking.setPromotionId(promotionId);
        booking.setDiscount(discount);
        booking.setTotalPrice(amount);
        booking.setBookingTime(currentTime);
        booking.setStatus(BookingStatus.PROCESSING.getValue());
        booking.setReviewed(false);
        booking.setReserved(isReserved);

        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
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
                        (String) obj[11],
                        (boolean) obj[12],
                        (String) obj[13]
                        ))
                .collect(Collectors.toList());
    }

    public BookingDetailResponse getBookingDetail(String id) {
        if (!bookingRepository.existsById(id)) {
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

    public void cancelBooking(String id) {
        try {
            var booking = bookingRepository.findBookingByIdAndStatus(id, BookingStatus.PROCESSING.getValue());

            if (booking.isReserved()) {
                int people = booking.getQuantityAdult() + booking.getQuantityChildren();
                scheduleService.minusQuantityPeople(booking.getScheduleId(), people);
            }

            booking.setStatus(BookingStatus.CANCEL.getValue());
            booking.setReserved(true);
            bookingRepository.save(booking);

            if (!booking.getPromotionId().equals("")) {
                promotionService.addQuantity(booking.getPromotionId(), 1);
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
        }
    }

    public void confirmBooking(String id) {
        try {
            var booking = bookingRepository.findBookingPaid(id);

            booking.setStatus(BookingStatus.CONFIRM.getValue());
            booking.setReviewed(true);
            bookingRepository.save(booking);

            tourService.addOrders(booking.getTourId(), 1);
        } catch (Exception e) {
            throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
        }
    }

    public void confirmReserve(String id) {
        var booking = bookingRepository.findBookingByIdAndStatusAndIsReserved(id, BookingStatus.PROCESSING.getValue(), false);

        if (booking == null) {
            throw new AppException(ErrorCode.BOOKING_NOT_EXITED);
        }

        int quantityPeople = booking.getQuantityAdult() + booking.getQuantityChildren();

        if (!scheduleService.existsScheduleByQuantityPeople(booking.getScheduleId(), quantityPeople)) {
            throw new AppException(ErrorCode.SCHEDULE_PEOPLE_INVALID);
        }

        booking.setReserved(true);
        String scheduleId = booking.getScheduleId();

        bookingRepository.save(booking);

        scheduleService.addQuantityPeople(scheduleId, quantityPeople);
    }

    public long getCountBookings() {
        return bookingRepository.countBookings();
    }

    public long getTotalRevenue() {
        return bookingRepository.totalRevenue();
    }

    public List<BookingsLatestResponse> getBookingsLatest() {
        return bookingRepository.findBookingsLatest();
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

        return bookingRepository.findTopPopularToursThisMonth(currentDate);
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

    public boolean sendInvoice(String bookingId, boolean isConfirm) {
        try {
            var invoice = getBookingCheckoutDetail(bookingId);
            String subject = String.format("Thông tin lịch đặt #%s", invoice.getCode());

            mailService.sendInvoice(invoice, subject, isConfirm);

            return true;
        } catch (Exception e) {
            return false;
        }
    }
}