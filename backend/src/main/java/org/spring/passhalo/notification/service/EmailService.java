package org.spring.passhalo.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.spring.passhalo.user.entity.EventInvitation;
import org.spring.passhalo.user.enums.EventRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

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

    public void sendEmailConfirmation(EventInvitation eventInvitation, String token) {
        String eventName = eventInvitation.getEvent().getName();
        String role;
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String expiresAt = eventInvitation.getExpiresAt().format(dtf);
        if (eventInvitation.getProposedRole() == EventRole.EVENT_ADMIN){
            role ="Amministratore";

        }else{
            role="Staff";
        }
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

            helper.setFrom(from);
            helper.setTo(eventInvitation.getRecipientEmail());
            helper.setSubject("Invito a collaborare all’evento: " + eventName);
            helper.setText("Sei stato invitato a collaborare all’evento " + eventName +" come "+ role + ".\n  Accetta l’invito entro " + expiresAt+".\n Per poter accettare accedi all'app e inserisci il codice: " + token);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            log.error("Failed to send confirmation email for event: {}. Reason: {}", eventName, e.getMessage(), e);
            throw new RuntimeException(e);

        }


    }
}
