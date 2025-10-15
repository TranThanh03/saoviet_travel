package com.websitesaoviet.WebsiteSaoViet.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.websitesaoviet.WebsiteSaoViet.dto.request.admin.EmailInvoiceRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.admin.BookingCheckoutDetailResponse;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
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

    String QUEUE_NAME = "mailQueue";

    @NonFinal
    @Value("${sendgrid.api-key}")
    String sendGridApiKey;

    @NonFinal
    @Value("${sendgrid.sender}")
    String senderEmail;

    public void sendMail(String to, String subject, String htmlContent) {
        Email from = new Email(senderEmail);
        Email recipient = new Email(to);
        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, recipient, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);

            if (response.getStatusCode() >= 400) {
                throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    public void sendToQueue(String to, String subject, String htmlContent) {
        String emailData = to + ";" + subject + ";" + htmlContent;
        rabbitTemplate.convertAndSend(QUEUE_NAME, emailData);
    }

    @RabbitListener(queues = "mailQueue")
    public void consumeEmailQueue(String message) {
        String[] parts = message.split(";", 3);
        if (parts.length == 3) {
            sendMail(parts[0], parts[1], parts[2]);
        }
    }

    public void sendInvoice(EmailInvoiceRequest request, BookingCheckoutDetailResponse invoice) {
        Date bookingDate = Date.from(invoice.getBookingTime().atZone(ZoneId.systemDefault()).toInstant());
        Date checkoutDate = invoice.getCheckoutTime() != null ? Date.from(invoice.getCheckoutTime().atZone(ZoneId.systemDefault()).toInstant()) : null;
        Date startDate = Date.from(invoice.getStartDate().atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(invoice.getEndDate().atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());
        Double totalAdultPrice = invoice.getAdultPrice() * invoice.getQuantityAdult();
        Double totalChildrenPrice = invoice.getChildrenPrice() * invoice.getQuantityChildren();

        Context context = new Context();
        context.setVariable("invoice", invoice);
        context.setVariable("isConfirm", request.isConfirm());
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

        String htmlContent = templateEngine.process("send-invoice", context);

        try {
            sendToQueue(invoice.getEmail(), request.getSubject(), htmlContent);
        } catch (Exception e) {
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    public static String formatNumberWithCommas(Double number) {
        Locale vietnamLocale = new Locale("vi", "VN");
        if (number == null) return "";
        NumberFormat format = NumberFormat.getNumberInstance(vietnamLocale);
        return format.format(number);
    }
}