package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.repository.SequenceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SequenceService {
    SequenceRepository sequenceRepository;

    @Transactional
    public int getNextNumber(String type) {
        int year = Year.now().getValue();

        sequenceRepository.upsert(type, year);
        return sequenceRepository.getLastNumber(type, year);
    }
}