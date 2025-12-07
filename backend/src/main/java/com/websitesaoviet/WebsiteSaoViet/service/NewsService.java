package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.NewsCreationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.NewsUpdateRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.NewsListResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.NewsResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.user.NewsSummaryResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.News;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.mapper.NewsMapper;
import com.websitesaoviet.WebsiteSaoViet.repository.NewsRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NewsService {
    NewsRepository newsRepository;
    NewsMapper newsMapper;
    SequenceService sequenceService;

    public NewsResponse createNews(NewsCreationRequest request) {
        News news = newsMapper.createNews(request);

        if (request.getType().equals("Nổi bật")) {
            news.setType("Nổi bật");
        } else {
            news.setType("Thường");
        }

        news.setCode(String.valueOf(getNextCode("news")));
        news.setViewCount(0);
        news.setTimeStamp(LocalDateTime.now());

        return newsMapper.toNewsResponse(newsRepository.save(news));
    }

    public Page<NewsListResponse> getNews(String keyword, Pageable pageable) {
        return newsRepository.findAllNews(keyword.trim(), pageable);
    }

    public NewsResponse getNewsById(String id) {
        var news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_EXITED));

        int viewCount = news.getViewCount();

        news.setViewCount(++viewCount);
        newsRepository.save(news);

        return newsMapper.toNewsResponse(news);
    }

    public NewsResponse getNewsByIdAndAdmin(String id) {
        var news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_EXITED));

        return newsMapper.toNewsResponse(news);
    }

    public NewsResponse updateNews(String id, NewsUpdateRequest request) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_EXITED));

        newsMapper.updateNews(news, request);

        if (request.getType().equals("Nổi bật")) {
            news.setType("Nổi bật");
        } else {
            news.setType("Thường");
        }

        news.setTimeStamp(LocalDateTime.now());

        return newsMapper.toNewsResponse(newsRepository.save(news));
    }

    @Transactional
    public void deleteNews(String id) {
        if (!newsRepository.existsById(id)) {
            throw new AppException(ErrorCode.NEWS_NOT_EXITED);
        }

        newsRepository.deleteById(id);
    }

    public String getNextCode(String type) {
        int nextCode = sequenceService.getNextNumber(type.toLowerCase());

        return "N" + Year.now().getValue() + String.format("%04d", nextCode);
    }

    public NewsSummaryResponse getOutstandingNews() {
        return newsRepository.findTop1OutstandingNews().get(0);
    }

    public List<NewsSummaryResponse> getTopNews() {
        Pageable pageable = Pageable.ofSize(5);
        return newsRepository.findTopNews(pageable);
    }

    public List<NewsSummaryResponse> getListOutstandingNews(String id) {
        Pageable pageable = Pageable.ofSize(10);
        return newsRepository.findListOutstandingNews(id, pageable);
    }

    public List<NewsSummaryResponse> getListTopNews(String id) {
        Pageable pageable = Pageable.ofSize(10);
        return newsRepository.findListTopNews(id, pageable);
    }
}