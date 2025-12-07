package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.ScheduleCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ScheduleListResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ScheduleStartDateResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.ScheduleResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ScheduleSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.ScheduleTourResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Schedule;
import com.websitesaoviet.WebsiteSaoViet.enums.CommonStatus;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.mapper.ScheduleMapper;
import com.websitesaoviet.WebsiteSaoViet.repository.ScheduleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScheduleService {
    ScheduleRepository scheduleRepository;
    ScheduleMapper scheduleMapper;
    SequenceService sequenceService;
    TourService tourService;
    RedisService redisService;

    public ScheduleResponse createSchedule(ScheduleCreationRequest request) {
        LocalDate today = LocalDate.now();
        LocalDate minStartDate = today.plusDays(3);

        if (scheduleRepository.existsScheduleByTourIdAndStartDate(request.getTourId(), request.getStartDate())) {
            throw new AppException(ErrorCode.SCHEDULE_EXITED);
        }

        if (request.getStartDate().isBefore(minStartDate)) {
            throw new AppException(ErrorCode.STARTDATE_INVALID);
        }

        var tour = tourService.getTourById(request.getTourId());

        Schedule schedule = scheduleMapper.createSchedule(request);

        schedule.setCode(getNextCode("schedule"));
        schedule.setEndDate(request.getStartDate().plusDays(tour.getQuantityDay() - 1));
        schedule.setQuantityPeople(0);
        schedule.setStatus(CommonStatus.NOT_STARTED.getValue());
        schedule.setCreatedTime(LocalDateTime.now());

        return scheduleMapper.toScheduleResponse(scheduleRepository.save(schedule));
    }

    public Page<ScheduleListResponse> getSchedules(String keyword, Pageable pageable) {
        String keywordText = keyword.trim();
        LocalDate keywordDate = null;

        if (!keywordText.equals("") && !keywordText.matches("^[a-zA-Z0-9]+$")) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
                keywordDate = LocalDate.parse(keyword, formatter);
                keywordText = null;
            } catch (Exception ignored) {
                throw new AppException(ErrorCode.DATETIME_INVALID);
            }
        }

        return scheduleRepository.findAllSchedules(keywordText, keywordDate, pageable);
    }

    public ScheduleResponse getScheduleById(String id) {
        return scheduleMapper.toScheduleResponse(scheduleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_EXITED)));
    }

    public List<ScheduleSummaryResponse> getSchedulesByTourId(String tourId) {
        List<ScheduleSummaryResponse> list = scheduleRepository.findSchedulesByTourId(tourId);
        List<ScheduleSummaryResponse> result = new ArrayList<>(list.size());

        for (ScheduleSummaryResponse s : list) {
            int available = redisService.getAvailablePeople(s.getId(), s.getQuantityPeople());

            if (available > 0) {
                s.setQuantityPeople(available);
                result.add(s);
            }
        }

        return result;
    }

    public ScheduleTourResponse getScheduleTourById(String id) {
        ScheduleTourResponse schedule = scheduleRepository.findScheduleTourById(id);
        int availablePeople = redisService.getAvailablePeople(id, schedule.getQuantityPeople());

        if (availablePeople <= 0) {
            throw new AppException(ErrorCode.SCHEDULE_NOT_EXITED);
        }

        schedule.setQuantityPeople(availablePeople);

        return schedule;
    }

    public List<ScheduleStartDateResponse> getStartDateByTourId(String tourId) {
        return scheduleRepository.findStartDateByTourId(tourId);
    }

    @Transactional
    public void deleteSchedule(String id) {
        if (scheduleRepository.existsScheduleByScheduleId(id)) {
            throw new AppException(ErrorCode.BOOKING_SUCCESSFULLY);
        } else if (scheduleRepository.existsByIdAndStatus(id, CommonStatus.IN_PROGRESS.getValue())) {
            throw new AppException(ErrorCode.SCHEDULE_IN_PROGRESS);
        }

        scheduleRepository.deleteById(id);
    }

    @Transactional
    public void deleteByTourId(String tourId) {
        if (scheduleRepository.existsScheduleByTourIdAndStatus(tourId, CommonStatus.IN_PROGRESS.getValue())) {
            throw new AppException(ErrorCode.SCHEDULE_IN_PROGRESS);
        }

        scheduleRepository.deleteAllByTourId(tourId);
    }

    public ScheduleResponse updateSchedule(String id, int totalPeople) {
        if (totalPeople < 1 || totalPeople > 100) {
            throw new AppException(ErrorCode.TOTAL_PEOPLE_INVALID);
        }

        var schedule = scheduleRepository.findScheduleValidById(id, totalPeople);

        if (schedule != null) {
            schedule.setTotalPeople(totalPeople);

            return scheduleMapper.toScheduleResponse(scheduleRepository.save(schedule));
        } else {
            throw new AppException(ErrorCode.SCHEDULE_INVALID);
        }
    }

    public boolean existsScheduleByTourIdAndStatus(String id, String status) {
        return scheduleRepository.existsScheduleByTourIdAndStatus(id, status);
    }

    public int getAvailablePeople(String id) {
        Integer availablePeople = scheduleRepository.getAvailablePeople(id);

        if (availablePeople == null) {
            throw new AppException(ErrorCode.SCHEDULE_NOT_EXITED);
        }

        if (availablePeople <= 0) {
            throw new AppException(ErrorCode.SCHEDULE_PEOPLE_INVALID);
        }

        return availablePeople;
    }

    public void addQuantityPeople(String id, int people) {
        scheduleRepository.addQuantityPeople(id, people);
    }

    public void minusQuantityPeople(String id, int people) {
        scheduleRepository.minusQuantityPeople(id, people);
    }

    public String getNextCode(String type) {
        int nextCode = sequenceService.getNextNumber(type.toLowerCase());

        return "LT" + Year.now().getValue() + String.format("%09d", nextCode);
    }
}