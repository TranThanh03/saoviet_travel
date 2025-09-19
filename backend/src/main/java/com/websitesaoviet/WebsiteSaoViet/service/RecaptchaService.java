package com.websitesaoviet.WebsiteSaoViet.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RecaptchaService {
    @NonFinal
    @Value("${recaptcha.cbSecret}")
    private String recaptchaCbSecret;

    @NonFinal
    @Value("${recaptcha.invSecret}")
    private String recaptchaInvSecret;

    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verifyCB(String token) {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, String> body = Map.of(
                "secret", recaptchaCbSecret,
                "response", token
        );

        Map<String, Object> resp = restTemplate.postForObject(
                VERIFY_URL + "?secret={secret}&response={response}",
                null, Map.class, body
        );

        return resp != null && (Boolean) resp.get("success");
    }

    public boolean verifyINV(String token) {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, String> body = Map.of(
                "secret", recaptchaInvSecret,
                "response", token
        );

        Map<String, Object> resp = restTemplate.postForObject(
                VERIFY_URL + "?secret={secret}&response={response}",
                null, Map.class, body
        );

        return resp != null && (Boolean) resp.get("success");
    }
}