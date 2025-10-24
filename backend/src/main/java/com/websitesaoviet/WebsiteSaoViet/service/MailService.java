package com.websitesaoviet.WebsiteSaoViet.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.*;
import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.EmailInvoiceRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.BookingCheckoutDetailResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.util.DomainUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.IOException;
import java.text.NumberFormat;
import java.time.ZoneId;
import java.util.Date;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MailService {

    RabbitTemplate rabbitTemplate;
    TemplateEngine templateEngine;

    static final String QUEUE_NAME = "mailQueue";

    @NonFinal
    @Value("${sendgrid.api-key}")
    String sendGridApiKey;

    @NonFinal
    @Value("${sendgrid.sender}")
    String senderEmail;

    @NonFinal
    @Value("${base.url}")
    String BASE_URL;

    public void sendMail(String to, String subject, String htmlContent) {
        Email from = new Email(senderEmail, "SaoViet Travel");
        Email recipient = new Email(to);
        Email replyTo = new Email("contact@saoviettravel.site");

        Content content = new Content("text/html", htmlContent);

        Mail mail = new Mail();
        mail.setFrom(from);
        mail.setSubject(subject);
        mail.addContent(content);
        mail.setReplyTo(replyTo);

        Personalization personalization = new Personalization();
        personalization.addTo(recipient);
        mail.addPersonalization(personalization);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        int maxRetries = 3;
        for (int i = 0; i < maxRetries; i++) {
            try {
                request.setMethod(Method.POST);
                request.setEndpoint("mail/send");
                request.setBody(mail.build());

                Response response = sg.api(request);

                if (response.getStatusCode() < 400) {
                    return;
                }

                if (response.getStatusCode() == 429 || response.getStatusCode() >= 500) {
                    Thread.sleep(2000L * (i + 1));
                    continue;
                }

                throw new AppException(ErrorCode.EMAIL_SEND_FAILED);

            } catch (IOException | InterruptedException e) {
                if (i == maxRetries - 1) {
                    throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
                }
            }
        }
    }

    public void sendToQueue(String to, String subject, String htmlContent) {
        try {
            String emailData = to + ";" + subject + ";" + htmlContent;
            rabbitTemplate.convertAndSend(QUEUE_NAME, emailData);
        } catch (Exception e) {
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    @RabbitListener(queues = QUEUE_NAME)
    public void consumeEmailQueue(String message) {
        try {
            String[] parts = message.split(";", 3);
            if (parts.length != 3) {
                return;
            }

            String to = parts[0];
            String subject = parts[1];
            String htmlContent = parts[2];

            sendMail(to, subject, htmlContent);
        } catch (Exception e) {
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    public void sendActivationEmail(String customerId, String email) {
        String subject = "Kích hoạt tài khoản";
        String activationLink = String.format("%s/customer/activate/%s", BASE_URL, customerId);

        Context context = new Context();
        context.setVariable("activationLink", activationLink);
        context.setVariable("baseUrl", BASE_URL);
        context.setVariable("website", DomainUtil.extractDomain(BASE_URL));

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
        context.setVariable("baseUrl", BASE_URL);
        context.setVariable("website", DomainUtil.extractDomain(BASE_URL));

        String htmlContent = templateEngine.process("send-invoice", context);

        sendToQueue(invoice.getEmail(), subject, htmlContent);
    }

    public static String formatNumberWithCommas(Double number) {
        Locale vietnamLocale = new Locale("vi", "VN");
        if (number == null) return "";
        NumberFormat format = NumberFormat.getNumberInstance(vietnamLocale);
        return format.format(number);
    }
}
