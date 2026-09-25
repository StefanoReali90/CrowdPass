package org.spring.passhalo.user.service;

import lombok.RequiredArgsConstructor;
import org.spring.passhalo.event.entity.Event;
import org.spring.passhalo.event.exception.AccessDeniedException;
import org.spring.passhalo.notification.service.EmailService;
import org.spring.passhalo.user.entity.EventInvitation;
import org.spring.passhalo.user.enums.EventRole;
import org.spring.passhalo.user.enums.MembershipState;
import org.spring.passhalo.user.enums.Role;
import org.spring.passhalo.user.exception.InvitationAlreadyExistsException;
import org.spring.passhalo.event.exception.EventNotFoundException;
import org.spring.passhalo.event.repository.EventRepository;
import org.spring.passhalo.user.entity.User;
import org.spring.passhalo.user.enums.InviteState;
import org.spring.passhalo.user.repository.EventInvitationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EventInvitationService {
    @Value("${app.time-zone}")
    private String timeZone;

    private final EventInvitationRepository eventInvitationRepository;
    private final EventRepository eventRepository;
    private final EmailService emailService;


    public void createInvitation(Long eventId, String inviteEmail, User admin) throws NoSuchAlgorithmException {
        String cleanedEmail = inviteEmail.trim().toLowerCase(Locale.ROOT);
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new EventNotFoundException("Event not found"));
        LocalDateTime now = LocalDateTime.now(ZoneId.of(timeZone));
        if(admin.getId().equals(event.getUser().getId())) {
            if(eventInvitationRepository.existsByEventIdAndRecipientEmailAndInviteStateAndExpiresAtAfter(eventId,cleanedEmail, InviteState.PENDING, now)) {
                throw new InvitationAlreadyExistsException("Invitation already exists");
            }
            EventInvitation eventInvitation = new EventInvitation();
            eventInvitation.setEvent(event);
            eventInvitation.setRecipientEmail(cleanedEmail);
            eventInvitation.setCreatedBy(admin);
            eventInvitation.setCreatedAt(now);
            eventInvitation.setExpiresAt(now.plusDays(7));
            eventInvitation.setProposedRole(EventRole.EVENT_ADMIN);
            SecureRandom random = new SecureRandom();
            byte[] tokenBytes = new byte[32];
            random.nextBytes(tokenBytes);
            String token = Base64.getEncoder().encodeToString(tokenBytes);
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] hash = sha256.digest(token.getBytes());
            String hashString = Base64.getEncoder().encodeToString(hash);
            eventInvitation.setTokenHash(hashString);
            eventInvitationRepository.save(eventInvitation);
            emailService.sendEmailConfirmation(eventInvitation, token);
        } else {
            throw new AccessDeniedException("User is not the owner of the event");
        }
    }
}