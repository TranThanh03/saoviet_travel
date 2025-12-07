package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MomoService {
    @NonFinal
    @Value("${momo.partnerCode}")
    protected String partnerCode;

    @NonFinal
    @Value("${momo.accessKey}")
    protected String accessKey;

    @NonFinal
    @Value("${momo.secretKey}")
    protected String secretKey;

    public String createMomoPayment(String orderId, int amount, String redirectUrl, String ipnUrl) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            Random random = new Random();
            String requestId = System.currentTimeMillis() + "" + random.nextInt(1000);
            String orderInfo = "Thanh toán qua MoMo";
            String requestType = "payWithATM";
            String extraData = String.format("Thanh toan don dat tour #%s.", orderId);

            String rawHash = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + ipnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + partnerCode +
                    "&redirectUrl=" + redirectUrl +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;

            String signature = generateSignature(rawHash);

            JSONObject requestBody = new JSONObject();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("partnerName", "Test");
            requestBody.put("storeId", "MomoTestStore");
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", redirectUrl);
            requestBody.put("ipnUrl", ipnUrl);
            requestBody.put("lang", "vi");
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", requestType);
            requestBody.put("signature", signature);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);

            String endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
            ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.POST, entity, String.class);
            JSONObject jsonResponse = new JSONObject(response.getBody());

            return jsonResponse.getString("payUrl");
        } catch (Exception e) {
            log.error("Payment MOMO failed: ", e);
            throw new AppException(ErrorCode.PAYMENT_MOMO_FAILED);
        }
    }

    public boolean verifySignature(Map<String, String> params) {
        try {
            String rawHash = "accessKey=" + accessKey +
                    "&amount=" + params.get("amount") +
                    "&extraData=" + params.get("extraData") +
                    "&message=" + params.get("message") +
                    "&orderId=" + params.get("orderId") +
                    "&orderInfo=" + params.get("orderInfo") +
                    "&orderType=" + params.get("orderType") +
                    "&partnerCode=" + params.get("partnerCode") +
                    "&payType=" + params.getOrDefault("payType", "") +
                    "&requestId=" + params.get("requestId") +
                    "&responseTime=" + params.get("responseTime") +
                    "&resultCode=" + params.get("resultCode") +
                    "&transId=" + params.get("transId");

            String generatedSignature = generateSignature(rawHash);
            String receivedSignature = params.get("signature");

            return generatedSignature.equals(receivedSignature);
        } catch (Exception e) {
            log.error("Payment MOMO failed: ", e);
            throw new AppException(ErrorCode.SIGNATURE_INVALID);
        }
    }

    private String generateSignature(String rawHash) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKeySpec);
            byte[] signedBytes = sha256Hmac.doFinal(rawHash.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : signedBytes) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("Payment MOMO failed: ", e);
            throw new AppException(ErrorCode.PAYMENT_MOMO_FAILED);
        }
    }

}