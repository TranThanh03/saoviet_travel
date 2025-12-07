package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.TourCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.TourUpdateRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.FilterToursAreaRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.FilterToursRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.SearchToursDestinationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.user.SearchToursRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ListToursResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.ToursSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.TourResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.*;
import com.websitesaoviet.WebsiteSaoViet.entity.Tour;
import com.websitesaoviet.WebsiteSaoViet.entity.TourWithMatch;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.mapper.TourMapper;
import com.websitesaoviet.WebsiteSaoViet.repository.TourRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Timestamp;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TourService {
    TourRepository tourRepository;
    TourMapper tourMapper;
    SequenceService sequenceService;
    HotTourService hotTourService;

    public TourResponse createTour(TourCreationRequest request) {
        LocalDateTime currentTime = LocalDateTime.now();

        Tour tour = tourMapper.createTour(request);

        tour.setCode(getNextCode("tour"));
        tour.setTimeStamp(currentTime);
        tour.setQuantityOrder(0);

        return tourMapper.toTourResponse(tourRepository.save(tour));
    }

    public Page<ToursSummaryResponse> getTours(String keyword, Pageable pageable) {
        String normalizedKeyword = normalize(keyword == null ? "" : keyword);

        List<Tour> tours = tourRepository.findAll();

        List<ToursSummaryResponse> filtered = tours.stream()
                .filter(tour -> {
                    String code = normalize(tour.getCode());
                    String name = normalize(tour.getName());
                    String destination= normalize(tour.getDestination());

                    return code.contains(normalizedKeyword) || name.contains(normalizedKeyword) || destination.contains(normalizedKeyword);
                })
                .map(tour -> new ToursSummaryResponse(
                        tour.getId(),
                        tour.getCode(),
                        tour.getName(),
                        tour.getDestination(),
                        tour.getArea(),
                        tour.getQuantityDay(),
                        tour.getQuantityOrder(),
                        tour.getTimeStamp()
                ))
                .sorted((t1, t2) -> t2.getTimeStamp().compareTo(t1.getTimeStamp()))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<ToursSummaryResponse> pageContent = filtered.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    public TourResponse getTourById(String id) {
        return tourMapper.toTourResponse(tourRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOUR_NOT_EXITED)));
    }

    public Tour getTourDetail(String id) {
        return tourRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOUR_NOT_EXITED));
    }

    public TourResponse updateTour(String id, TourUpdateRequest request) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOUR_NOT_EXITED));

        LocalDateTime currentTime = LocalDateTime.now();

        tourMapper.updateTour(tour, request);
        tour.setTimeStamp(currentTime);

        return tourMapper.toTourResponse(tourRepository.save(tour));
    }

    @Transactional
    public void deleteTour(String id) {
        if (!tourRepository.existsById(id)) {
            throw new AppException(ErrorCode.TOUR_NOT_EXITED);
        }

        tourRepository.deleteById(id);
    }

    public void addOrders(String id, int orders) {
        tourRepository.addOrders(id, orders);
    }

    public String getNextCode(String type) {
        int nextCode = sequenceService.getNextNumber(type.toLowerCase());

        return "T" + Year.now().getValue() + String.format("%06d", nextCode);
    }

    public Page<FilterToursResponse> getFilteredTours(FilterToursRequest request, int page, int size) {
        Double minPrice = null;
        Double maxPrice = null;
        String area = null;

        if (request.getPrice() != null && request.getPrice().size() > 0) {
            if (request.getPrice().get(0) >= 0) {
                minPrice = request.getPrice().get(0);
            }
            if (request.getPrice().size() > 1) {
                maxPrice = request.getPrice().get(1);
            }
        }

        if (request.getArea() != null) {
            switch (request.getArea().toLowerCase()) {
                case "b" -> area = "b";
                case "t" -> area = "t";
                case "n" -> area = "n";
                default -> area = null;
            }
        }

        Integer rating = (request.getRating() != null && request.getRating() >= 1 && request.getRating() <= 5)
                ? request.getRating() : null;

        Integer quantityDay = (request.getDuration() != null && request.getDuration() >= 1 && request.getDuration() <= 100)
                ? request.getDuration() : null;

        Sort sort = Sort.unsorted();

        if (request.getSort() != null) {
            sort = switch (request.getSort()) {
                case "high-to-low" -> Sort.by(Sort.Direction.DESC, "adult_price");
                case "low-to-high" -> Sort.by(Sort.Direction.ASC, "adult_price");
                case "new" -> Sort.by(Sort.Direction.DESC, "created_time");
                case "old" -> Sort.by(Sort.Direction.ASC, "created_time");
                case "default" -> Sort.by(Sort.Direction.DESC, "quantity_order");
                default -> Sort.unsorted();
            };
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Object[]> rawResult = tourRepository.findFilteredTours(
                minPrice, maxPrice, area, rating, quantityDay, pageable
        );

        return rawResult.map(obj -> new FilterToursResponse(
                (String) obj[0],
                (String) obj[1],
                (String) obj[2],
                (String) obj[3],
                ((Number) obj[4]).intValue(),
                (Double) obj[5],
                ((Number) obj[6]).intValue(),
                ((Number) obj[7]).intValue()
        ));
    }

    public AreaTourCountResponse getCountToursByArea() {
        return tourRepository.countToursByArea();
    }

    public List<PopularToursResponse> getPopularTours() {
        List<PopularToursResponse> listTours = tourRepository.findPopularTours()
                                                        .stream()
                                                        .map(tourMapper::toPopularToursResponse)
                                                        .collect(Collectors.toList());

        if (listTours.isEmpty()) {
            listTours = tourRepository.find5PopularTours()
                    .stream().map(tourMapper::to5PopularToursResponse)
                    .collect(Collectors.toList());
        }

        return listTours;
    }

    public Page<SearchToursResponse> getSearchTours(SearchToursRequest request, int page, int size) {
        String keyword = normalize(request.getKeyword() == null ? "" : request.getKeyword());
        String sort = request.getSort() == null ? "default" : request.getSort();

        Pageable pageable = PageRequest.of(page, size);

        List<Object[]> rawResult = tourRepository.findSearchTours();

        List<SearchToursResponse> allTours = rawResult.stream()
                .map(obj -> new SearchToursResponse(
                        (String) obj[0],
                        (String) obj[1],
                        (String) obj[2],
                        (String) obj[3],
                        ((Number) obj[4]).intValue(),
                        (Double) obj[5],
                        ((Number) obj[6]).intValue(),
                        ((Number) obj[7]).intValue(),
                        ((Timestamp) obj[8]).toLocalDateTime()
                ))
                .toList();

        List<SearchToursResponse> filtered = allTours.stream()
                .filter(tour -> {
                    String name = normalize(tour.getName());
                    String dest = normalize(tour.getDestination());
                    return name.contains(keyword) || dest.contains(keyword);
                })
                .toList();

        Comparator<SearchToursResponse> comparator = switch (sort) {
            case "new" -> Comparator.comparing(SearchToursResponse::getCreatedTime).reversed();
            case "old" -> Comparator.comparing(SearchToursResponse::getCreatedTime);
            case "high-to-low" -> Comparator.comparing(SearchToursResponse::getAdultPrice).reversed();
            case "low-to-high" -> Comparator.comparing(SearchToursResponse::getAdultPrice);
            default -> Comparator.comparing(SearchToursResponse::getQuantityDay);
        };

        List<SearchToursResponse> sorted = filtered.stream()
                .sorted(comparator)
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), sorted.size());
        List<SearchToursResponse> paged = sorted.subList(start, end);

        return new PageImpl<>(paged, pageable, sorted.size());
    }

    public static String normalize(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String noDiacritics = pattern.matcher(normalized).replaceAll("")
                .replaceAll("đ", "d")
                .replaceAll("Đ", "D")
                .toLowerCase();

        noDiacritics = noDiacritics.trim().replaceAll("\\s+", " ");

        return noDiacritics;
    }

    public Page<SearchToursResponse> getSearchToursByDestination(SearchToursDestinationRequest request, int page, int size) {
        String sort = request.getSort() == null ? "default" : request.getSort();
        Pageable pageable = PageRequest.of(page, size);

        List<Object[]> rawResult = tourRepository.findSearchToursByDestination(request.getDestination().trim(), request.getStartDate(), request.getEndDate());

        List<SearchToursResponse> allTours = rawResult.stream()
                .map(obj -> new SearchToursResponse(
                        (String) obj[0],
                        (String) obj[1],
                        (String) obj[2],
                        (String) obj[3],
                        ((Number) obj[4]).intValue(),
                        (Double) obj[5],
                        ((Number) obj[6]).intValue(),
                        ((Number) obj[7]).intValue(),
                        ((Timestamp) obj[8]).toLocalDateTime()
                ))
                .toList();

        Comparator<SearchToursResponse> comparator = switch (sort) {
            case "new" -> Comparator.comparing(SearchToursResponse::getCreatedTime).reversed();
            case "old" -> Comparator.comparing(SearchToursResponse::getCreatedTime);
            case "high-to-low" -> Comparator.comparing(SearchToursResponse::getAdultPrice).reversed();
            case "low-to-high" -> Comparator.comparing(SearchToursResponse::getAdultPrice);
            default -> Comparator.comparing(SearchToursResponse::getQuantityDay);
        };

        List<SearchToursResponse> sorted = allTours.stream()
                .sorted(comparator)
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), sorted.size());
        List<SearchToursResponse> paged = sorted.subList(start, end);

        return new PageImpl<>(paged, pageable, sorted.size());
    }

    public Page<FilterToursAreaResponse> getFilteredToursByArea(FilterToursAreaRequest request, int page, int size) {
        Double minPrice = null;
        Double maxPrice = null;
        String area = null;
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();
        Sort sort = Sort.unsorted();

        if (request.getPrice() != null && request.getPrice().size() > 0) {
            if (request.getPrice().get(0) >= 0) {
                minPrice = request.getPrice().get(0);
            }
            if (request.getPrice().size() > 1) {
                maxPrice = request.getPrice().get(1);
            }
        }

        if (request.getArea() != null) {
            switch (request.getArea().toLowerCase()) {
                case "b" -> area = "b";
                case "t" -> area = "t";
                case "n" -> area = "n";
                default -> area = null;
            }
        }

        Integer quantityDay = (request.getDuration() != null && request.getDuration() >= 1 && request.getDuration() <= 100)
                ? request.getDuration() : null;

        if (request.getSort() != null) {
            sort = switch (request.getSort()) {
                case "high-to-low" -> Sort.by(Sort.Direction.DESC, "adult_price");
                case "low-to-high" -> Sort.by(Sort.Direction.ASC, "adult_price");
                case "new" -> Sort.by(Sort.Direction.DESC, "created_time");
                case "old" -> Sort.by(Sort.Direction.ASC, "created_time");
                default -> Sort.unsorted();
            };
        }

        if (startDate != null) {
            sort = sort.and(Sort.by(Sort.Direction.ASC, "start_date"));
        } else if (endDate != null) {
            sort = sort.and(Sort.by(Sort.Direction.DESC, "end_date"));
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Object[]> rawResult = tourRepository.findFilteredToursByArea(
                minPrice, maxPrice, area, startDate, endDate, quantityDay, pageable
        );

        return rawResult.map(obj -> new FilterToursAreaResponse(
                (String) obj[0],
                (String) obj[1],
                (String) obj[2],
                (String) obj[3],
                ((Number) obj[4]).intValue(),
                (Double) obj[5],
                ((Date) obj[6]).toLocalDate(),
                ((Date) obj[7]).toLocalDate(),
                ((Number) obj[8]).intValue(),
                ((Number) obj[9]).intValue()
        ));
    }

    public long getCount() {
        return tourRepository.count();
    }

    public List<SimilarToursResponse> getSimilarTours(String id, String selectedDestinations, Integer quantityDay) {
        if (selectedDestinations == null || selectedDestinations.trim().isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> selectedLower = Arrays.stream(selectedDestinations.split(" - "))
                .map(d -> d.trim().toLowerCase())
                .collect(Collectors.toSet());

        List<Tour> listTour = tourRepository.findAllBySimilar(id).stream()
                .map(t -> new TourWithMatch(t, computeMatchCount(t.getDestination(), selectedLower)))
                .filter(t -> t.getMatchCount() > 0)
                .sorted((a, b) -> {
                    int cmp = Integer.compare(b.getMatchCount(), a.getMatchCount());
                    if (cmp != 0) return cmp;

                    if (quantityDay != null) {
                        boolean aMatch = a.getTour().getQuantityDay() == quantityDay;
                        boolean bMatch = b.getTour().getQuantityDay() == quantityDay;
                        return Boolean.compare(bMatch, aMatch);
                    }
                    return 0;
                })
                .limit(2)
                .map(twm -> twm.getTour())
                .collect(Collectors.toList());

        return tourMapper.toSimilarToursResponse(listTour);
    }

    private int computeMatchCount(String destString, Set<String> selectedLower) {
        String normalized = destString.replace("–", "-");

        return (int) Arrays.stream(normalized.split(" - "))
                .map(s -> s.trim().toLowerCase())
                .filter(selectedLower::contains)
                .count();
    }

    public List<ListToursResponse> getListTours() {
        return tourMapper.toListTours(tourRepository.findAll());
    }

    public List<FilterToursResponse> getHotTours() {
        String destination = hotTourService.checkHotTour();

        if (destination == null || destination.trim().isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> selectedLower = Arrays.stream(destination.split(", "))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<Object[]> rawTours = tourRepository.findHotTours();

        List<TourWithMatch> tourWithMatches = rawTours.stream()
                .map(obj -> {
                    String dest = (String) obj[2];
                    int matchCount = computeMatchCount(dest, selectedLower);
                    return new TourWithMatch(obj, matchCount);
                })
                .filter(twm -> twm.getMatchCount() > 0)
                .sorted((a, b) -> Integer.compare(b.getMatchCount(), a.getMatchCount()))
                .limit(8)
                .collect(Collectors.toList());

        return tourWithMatches.stream()
                .map(twm -> {
                    Object[] obj = twm.getRawTour();
                    return new FilterToursResponse(
                            (String) obj[0],
                            (String) obj[1],
                            (String) obj[2],
                            (String) obj[3],
                            ((Number) obj[4]).intValue(),
                            ((Number) obj[5]).doubleValue(),
                            ((Number) obj[6]).intValue(),
                            ((Number) obj[7]).intValue()
                    );
                })
                .collect(Collectors.toList());
    }

    public List<ChatToursResponse> getChatTours(Object response) {
        Map<String, Object> map = (Map<String, Object>) response;
        Double minPrice = null;
        Double maxPrice = null;
        String destination = "";
        String area = null;
        Integer quantityDay = null;
        LocalDate startDate = null;
        LocalDate endDate = null;
        Comparator<Object[]> comparator = null;

        if (map.get("minPrice") != null)
            minPrice = Double.valueOf(map.get("minPrice").toString()) > 0 ? Double.valueOf(map.get("minPrice").toString()) : null;

        if (map.get("maxPrice") != null)
            maxPrice = Double.valueOf(map.get("maxPrice").toString()) > 0 ? Double.valueOf(map.get("maxPrice").toString()) : null;

        if (map.get("startDate") != null) {
            if (isValidDate(map.get("startDate").toString(), "yyyy-MM-dd")) {
                startDate = LocalDate.parse(map.get("startDate").toString());
            } else {
                throw new AppException(ErrorCode.CHATBOT_DATE_INVALID);
            }
        }

        if (map.get("endDate") != null) {
            if (isValidDate(map.get("endDate").toString(), "yyyy-MM-dd")) {
                endDate = LocalDate.parse(map.get("endDate").toString());
            } else {
                throw new AppException(ErrorCode.CHATBOT_DATE_INVALID);
            }
        }

        if (map.get("area") != null) {
            String a = map.get("area").toString().toLowerCase();

            if (a.equals("b") || a.equals("t") || a.equals("n")) {
                area = a;
            }
        }

        if (map.get("quantityDay") != null) {
            int qd = Integer.parseInt(map.get("quantityDay").toString());

            if (qd >= 1 && qd <= 99) {
                quantityDay = qd;
            }
        }

        List<Object[]> rawResult = tourRepository.findChatTours(
                minPrice, maxPrice, area, startDate, endDate, quantityDay
        );

        if (map.get("sorted") != null) {
            String sortKey = map.get("sorted").toString();
            switch (sortKey) {
                case "high-to-low" -> comparator = Comparator.comparingDouble(o -> -((Number) o[5]).doubleValue());
                case "low-to-high" -> comparator = Comparator.comparingDouble(o -> ((Number) o[5]).doubleValue());
                case "new" -> comparator = Comparator.comparing(o -> ((Date) o[9]));
                case "old" -> comparator = Comparator.comparing(o -> ((Date) o[9]));
            }
        }

        if (startDate != null) {
            comparator = comparator == null
                    ? Comparator.comparing(o -> (Date) o[6])
                    : comparator.thenComparing(o -> (Date) o[6]);
        } else if (endDate != null) {
            comparator = comparator == null
                    ? Comparator.comparing((Object[] o) -> (Date) o[7]).reversed()
                    : comparator.thenComparing((Object[] o) -> (Date) o[7], Comparator.reverseOrder());
        }

        if (map.get("destination") != null) {
            Object destinations = map.get("destination");
            if (destinations instanceof List<?>) {
                destination = ((List<?>) destinations).stream()
                        .map(Object::toString)
                        .collect(Collectors.joining(", "));
            } else {
                destination = destinations.toString();
            }

            Set<String> selectedLower = Arrays.stream(destination.split(", "))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());

            return rawResult.stream()
                    .map(obj -> {
                        String dest = (String) obj[2];
                        int matchCount = computeMatchCount(dest, selectedLower);
                        return new TourWithMatch(obj, matchCount);
                    })
                    .filter(twm -> twm.getMatchCount() > 0)
                    .sorted(Comparator.comparingInt(TourWithMatch::getMatchCount).reversed())
                    .limit(6)
                    .map(twm -> {
                        Object[] obj = twm.getRawTour();
                        return new ChatToursResponse(
                                (String) obj[0],
                                (String) obj[1],
                                (String) obj[2],
                                (String) obj[3],
                                ((Number) obj[4]).intValue(),
                                ((Number) obj[5]).doubleValue(),
                                ((Date) obj[6]).toLocalDate(),
                                ((Date) obj[7]).toLocalDate(),
                                ((Number) obj[8]).intValue()
                        );
                    })
                    .collect(Collectors.toList());
        }

        if (comparator != null) {
            rawResult.sort(comparator);
        }

        return rawResult.stream()
                .limit(6)
                .map(obj -> new ChatToursResponse(
                        (String) obj[0],
                        (String) obj[1],
                        (String) obj[2],
                        (String) obj[3],
                        ((Number) obj[4]).intValue(),
                        ((Number) obj[5]).doubleValue(),
                        toLocalDate(obj[6]),
                        toLocalDate(obj[7]),
                        ((Number) obj[8]).intValue()
                ))
                .collect(Collectors.toList());
    }

    private LocalDate toLocalDate(Object obj) {
        if (obj instanceof Timestamp ts) {
            return ts.toLocalDateTime().toLocalDate();
        } else if (obj instanceof java.sql.Date date) {
            return date.toLocalDate();
        } else {
            return null;
        }
    }

    public static boolean isValidDate(String dateStr, String format) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(format);
            LocalDate.parse(dateStr, formatter);

            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }
}