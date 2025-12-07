package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VnpayService {

    @NonFinal
    @Value("${vnpay.tmnCode}")
    public String tmnCode;

    @NonFinal
    @Value("${vnpay.hashSecret}")
    public String hashSecret;

    public String createVnpayPayment(String orderId, int amount, String redirectUrl) {
        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String orderType = "bill";
            String vnp_IpAddr = "127.0.0.1";
            String bankCode = "NCB";
            String extraData = String.format("Thanh toan don dat tour #%s.", orderId);

            String sandboxUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

            Map<String, String> vnp_Params = new HashMap<>();

            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", tmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", orderId);
            vnp_Params.put("vnp_OrderInfo", extraData);
            vnp_Params.put("vnp_OrderType", orderType);
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", redirectUrl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
            vnp_Params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
            vnp_Params.put("vnp_BankCode", bankCode);

            String hashData = buildHashData(vnp_Params);
            String query = hashData + "&vnp_SecureHash=" + hmacSHA512(hashSecret, hashData);

            return sandboxUrl + "?" + query;
        } catch (Exception e) {
            log.error("Payment VNPAY failed: ", e);
            throw new AppException(ErrorCode.PAYMENT_VNPAY_FAILED);
        }
    }

    public boolean verifySignature(Map<String, String> params) {
        try {
            String vnpSecureHash = params.get("vnp_SecureHash");
            if (vnpSecureHash == null) {
                return false;
            }

            Map<String, String> inputData = new HashMap<>(params);
            inputData.remove("vnp_SecureHash");
            inputData.remove("vnp_SecureHashType");

            String hashData = buildHashData(inputData);
            String calculatedHash = hmacSHA512(hashSecret, hashData);

            return calculatedHash.equalsIgnoreCase(vnpSecureHash);
        } catch (Exception e) {
            log.error("Payment VNPAY failed: ", e);
            throw new AppException(ErrorCode.SIGNATURE_INVALID);
        }
    }

    private String buildHashData(Map<String, String> data) {
        return data.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> entry.getKey() + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII))
                .collect(Collectors.joining("&"));
    }

    private String hmacSHA512(String key, String data) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Payment VNPAY failed: ", e);
            throw new AppException(ErrorCode.PAYMENT_VNPAY_FAILED);
        }
    }
}