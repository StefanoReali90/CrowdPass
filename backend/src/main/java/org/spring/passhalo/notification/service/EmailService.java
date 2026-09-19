package org.spring.passhalo.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${MAIL_FROM}")
    private String from;

    private final JavaMailSender mailSender;

    @Async
    public void sendBookingConfirmation(String to, String customerName, String eventName, byte[] qrCodeBytes) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("Conferma prenotazione per " + eventName);
            helper.setText("Gentile " + customerName + ",\n\nLa tua prenotazione per l'evento " + eventName + " è stata confermata.\n\nAllegato il codice QR per il tuo ingresso.");
            helper.addAttachment("passhalo_ticket.png", new ByteArrayResource(qrCodeBytes));
            mailSender.send(mimeMessage);


            log.info("Sending booking confirmation email for event: {}", eventName);
        } catch (MessagingException e) {
            log.error("Failed to send booking confirmation email for event: {}. Reason: {}", eventName, e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

}
