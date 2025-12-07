package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.configuration.RabbitMQConfig;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.SendMailMessage;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.BookingCheckoutDetailResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.util.DomainUtil;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.text.NumberFormat;
import java.time.ZoneId;
import java.util.Date;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MailService {
    RabbitTemplate rabbitTemplate;
    TemplateEngine templateEngine;
    JavaMailSender mailSender;

    static final int MAX_RETRY = 2;

    @NonFinal
    @Value("${mail.sender}")
    String MAIL_SENDER;

    @NonFinal
    @Value("${app.fe-base-url}")
    String FE_BASE_URL;

    public void sendToQueue(String to, String subject, String htmlContent) {
        try {
            SendMailMessage message = new SendMailMessage(to, subject, htmlContent, 0);

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.MAIL_EXCHANGE,
                    RabbitMQConfig.MAIL_ROUTING_KEY,
                    message
            );
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.MAIL_QUEUE)
    public void consume(SendMailMessage message) {
        try {
            sendMail(message.getTo(), message.getSubject(), message.getContent());
        } catch (Exception e) {
            log.error(e.getMessage());

            if (message.getRetryCount() < MAX_RETRY) {
                message.setRetryCount(message.getRetryCount() + 1);

                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.MAIL_EXCHANGE,
                        RabbitMQConfig.MAIL_RETRY_ROUTING_KEY,
                        message
                );
            } else {
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.MAIL_EXCHANGE,
                        RabbitMQConfig.MAIL_DEAD_ROUTING_KEY,
                        message
                );
            }
        }
    }

    public void sendMail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    "UTF-8"
            );

            helper.setFrom(MAIL_SENDER);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    public void sendActivationEmail(String customerId, String email) {
        String subject = "Kích hoạt tài khoản";
        String activationLink = String.format("%s/customer/activate/%s", FE_BASE_URL, customerId);

        Context context = new Context();

        context.setVariable("activationLink", activationLink);
        context.setVariable("feBaseUrl", FE_BASE_URL);
        context.setVariable("website", DomainUtil.extractDomain(FE_BASE_URL));

        String emailContent = templateEngine.process("activate-account", context);

        sendToQueue(email, subject, emailContent);
    }

    public void sendInvoice(BookingCheckoutDetailResponse invoice, String subject, boolean isConfirm) {
        Date bookingDate = Date.from(invoice.getBookingTime().atZone(ZoneId.systemDefault()).toInstant());
        Date checkoutDate = invoice.getCheckoutTime() != null
                ? Date.from(invoice.getCheckoutTime().atZone(ZoneId.systemDefault()).toInstant()) : null;
        Date startDate = Date.from(invoice.getStartDate().atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(invoice.getEndDate().atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());

        Double totalAdultPrice = invoice.getAdultPrice() * invoice.getQuantityAdult();
        Double totalChildrenPrice = invoice.getChildrenPrice() * invoice.getQuantityChildren();

        Context context = new Context();

        context.setVariable("invoice", invoice);
        context.setVariable("isConfirm", isConfirm);
        context.setVariable("bookingDate", bookingDate);
        context.setVariable("checkoutDate", checkoutDate);
        context.setVariable("startDate", startDate);
        context.setVariable("endDate", endDate);
        context.setVariable("adultPrice", formatNumberWithCommas(invoice.getAdultPrice()));
        context.setVariable("totalAdultPrice", formatNumberWithCommas(totalAdultPrice));
        context.setVariable("childrenPrice", formatNumberWithCommas(invoice.getChildrenPrice()));
        context.setVariable("totalChildrenPrice", formatNumberWithCommas(totalChildrenPrice));
        context.setVariable("totalCost", formatNumberWithCommas(totalAdultPrice + totalChildrenPrice));
        context.setVariable("discount", formatNumberWithCommas(invoice.getDiscount()));
        context.setVariable("totalPrice", formatNumberWithCommas(invoice.getTotalPrice()));
        context.setVariable("feBaseUrl", FE_BASE_URL);
        context.setVariable("website", DomainUtil.extractDomain(FE_BASE_URL));

        String htmlContent = templateEngine.process("send-invoice", context);

        sendToQueue(invoice.getEmail(), subject, htmlContent);
    }

    public void sendForgotPasswordEmail(String email, int otp, Long ttl) {
        String subject = "Mã OTP đặt lại mật khẩu";
        Long minutes = ttl / 60;
        Long seconds = ttl % 60;
        Context context = new Context();

        context.setVariable("otp", otp);
        context.setVariable("minutes", minutes);
        context.setVariable("seconds", seconds);
        context.setVariable("feBaseUrl", FE_BASE_URL);
        context.setVariable("website", DomainUtil.extractDomain(FE_BASE_URL));

        String emailContent = templateEngine.process("forgot-password", context);

        sendToQueue(email, subject, emailContent);
    }

    public static String formatNumberWithCommas(Double number) {
        Locale vietnamLocale = new Locale("vi", "VN");

        if (number == null) return "";
        NumberFormat format = NumberFormat.getNumberInstance(vietnamLocale);

        return format.format(number);
    }
}
