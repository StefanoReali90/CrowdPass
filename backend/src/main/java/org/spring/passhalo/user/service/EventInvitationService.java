package org.spring.passhalo.user.service;

import lombok.RequiredArgsConstructor;
import org.spring.passhalo.event.entity.Event;
import org.spring.passhalo.event.exception.AccessDeniedException;
import org.spring.passhalo.event.exception.EventNotFoundException;
import org.spring.passhalo.event.repository.EventRepository;
import org.spring.passhalo.notification.service.EmailService;
import org.spring.passhalo.user.entity.EventInvitation;
import org.spring.passhalo.user.entity.EventMembership;
import org.spring.passhalo.user.entity.User;
import org.spring.passhalo.user.enums.EventRole;
import org.spring.passhalo.user.enums.InviteState;
import org.spring.passhalo.user.enums.MembershipState;
import org.spring.passhalo.user.exception.InvalidInvitationException;
import org.spring.passhalo.user.exception.InvitationAlreadyExistsException;
import org.spring.passhalo.user.repository.EventInvitationRepository;
import org.spring.passhalo.user.repository.EventMembershipRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EventInvitationService {

    @Value("${app.time-zone}")
    private String timeZone;

    private final EventInvitationRepository eventInvitationRepository;
    private final EventRepository eventRepository;
    private final EmailService emailService;
    private final EventMembershipRepository eventMembershipRepository;

    @Transactional
    public void createInvitation(
            Long eventId,
            String inviteEmail,
            User admin
    ) throws NoSuchAlgorithmException {

        String cleanedEmail = inviteEmail
                .trim()
                .toLowerCase(Locale.ROOT);

        Event event = eventRepository
                .findById(eventId)
                .orElseThrow(() ->
                        new EventNotFoundException("Event not found")
                );

        LocalDateTime now =
                LocalDateTime.now(ZoneId.of(timeZone));

        if (!admin.getId().equals(event.getUser().getId())) {
            throw new AccessDeniedException(
                    "User is not the owner of the event"
            );
        }

        boolean invitationAlreadyExists =
                eventInvitationRepository
                        .existsByEventIdAndRecipientEmailAndInviteStateAndExpiresAtAfter(
                                eventId,
                                cleanedEmail,
                                InviteState.PENDING,
                                now
                        );

        if (invitationAlreadyExists) {
            throw new InvitationAlreadyExistsException(
                    "Invitation already exists"
            );
        }

        EventInvitation eventInvitation =
                new EventInvitation();

        eventInvitation.setEvent(event);
        eventInvitation.setRecipientEmail(cleanedEmail);
        eventInvitation.setCreatedBy(admin);
        eventInvitation.setCreatedAt(now);
        eventInvitation.setExpiresAt(now.plusDays(7));
        eventInvitation.setProposedRole(EventRole.EVENT_ADMIN);
        eventInvitation.setInviteState(InviteState.PENDING);

        SecureRandom random = new SecureRandom();

        byte[] tokenBytes = new byte[32];

        random.nextBytes(tokenBytes);

        String token =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(tokenBytes);

        MessageDigest sha256 =
                MessageDigest.getInstance("SHA-256");

        byte[] hash =
                sha256.digest(
                        token.getBytes(StandardCharsets.UTF_8)
                );

        String hashString =
                Base64.getEncoder()
                        .encodeToString(hash);

        eventInvitation.setTokenHash(hashString);

        eventInvitationRepository.save(eventInvitation);

        emailService.sendEmailConfirmation(
                eventInvitation,
                token
        );
    }

    @Transactional
    public void acceptInvitation(
            String token,
            User user
    ) throws NoSuchAlgorithmException {

        /*
         * Validazione parametri iniziali.
         */
        if (token == null || token.isBlank() || user == null) {
            throw new InvalidInvitationException(
                    "Invalid invitation"
            );
        }

        LocalDateTime now =
                LocalDateTime.now(ZoneId.of(timeZone));

        /*
         * Il token ricevuto viene hashato.
         * Nel DB è salvato soltanto il suo hash.
         */
        MessageDigest sha256 =
                MessageDigest.getInstance("SHA-256");

        byte[] hash =
                sha256.digest(
                        token.getBytes(StandardCharsets.UTF_8)
                );

        String hashString =
                Base64.getEncoder()
                        .encodeToString(hash);

        /*
         * Recupero dell'invito tramite hash del token.
         */
        EventInvitation invitation =
                eventInvitationRepository
                        .findByTokenHash(hashString)
                        .orElseThrow(() ->
                                new InvalidInvitationException(
                                        "Not valid token"
                                )
                        );

        /*
         * L'invito deve essere ancora PENDING.
         */
        if (invitation.getInviteState() != InviteState.PENDING) {
            throw new InvalidInvitationException(
                    "Invitation is not pending"
            );
        }

        /*
         * L'invito non deve essere scaduto.
         */
        if (!invitation.getExpiresAt().isAfter(now)) {
            throw new InvalidInvitationException(
                    "Invitation expired"
            );
        }

        /*
         * L'invito può essere accettato soltanto
         * dall'utente avente la stessa email
         * del destinatario.
         */
        if (!invitation
                .getRecipientEmail()
                .trim()
                .equalsIgnoreCase(
                        user.getEmail().trim()
                )) {

            throw new InvalidInvitationException(
                    "Invitation does not belong to this user"
            );
        }

        /*
         * Il proprietario dell'evento
         * non può diventare collaboratore.
         */
        if (invitation
                .getEvent()
                .getUser()
                .getId()
                .equals(user.getId())) {

            throw new InvalidInvitationException(
                    "Event owner cannot accept this invitation"
            );
        }

        /*
         * Verifichiamo se esiste già una membership
         * per la coppia:
         *
         * event + collaborator
         */
        Optional<EventMembership> existingMembership =
                eventMembershipRepository
                        .findByEventIdAndCollaboratorId(
                                invitation.getEvent().getId(),
                                user.getId()
                        );

        EventMembership membership;

        if (existingMembership.isEmpty()) {

            /*
             * Nessuna membership precedente.
             *
             * Creiamo una nuova membership ACTIVE.
             */
            membership = new EventMembership();

            membership.setEvent(
                    invitation.getEvent()
            );

            membership.setCollaborator(user);

            membership.setMembershipState(
                    MembershipState.ACTIVE
            );

            membership.setRole(
                    invitation.getProposedRole()
            );

            membership.setCreatedAt(now);

            membership.setCreatedBy(
                    invitation.getCreatedBy()
            );

            membership.setValidFrom(now);

            membership.setValidUntil(null);

            membership.setRevokedAt(null);

        } else {

            /*
             * Esiste già una membership.
             */
            membership = existingMembership.get();

            switch (membership.getMembershipState()) {

                /*
                 * L'utente è già collaboratore attivo.
                 */
                case ACTIVE ->
                        throw new InvalidInvitationException(
                                "User is already an active member of this event"
                        );

                /*
                 * La membership esiste ma era stata revocata.
                 *
                 * Non ne creiamo una nuova:
                 * riattiviamo quella esistente.
                 */
                case REVOKED -> {

                    membership.setMembershipState(
                            MembershipState.ACTIVE
                    );

                    membership.setRole(
                            invitation.getProposedRole()
                    );

                    membership.setValidFrom(now);

                    membership.setValidUntil(null);

                    membership.setRevokedAt(null);
                }

                /*
                 * Protezione nel caso in futuro vengano
                 * introdotti altri stati.
                 */
                default ->
                        throw new InvalidInvitationException(
                                "Invalid membership state"
                        );
            }
        }

        /*
         * Salva:
         *
         * - la nuova membership
         *
         * oppure
         *
         * - la membership REVOKED riattivata.
         */
        eventMembershipRepository.save(membership);

        /*
         * L'invito è stato utilizzato con successo.
         */
        invitation.setInviteState(
                InviteState.ACCEPTED
        );

        invitation.setAcceptedAt(now);

        invitation.setAcceptedBy(user);

        eventInvitationRepository.save(invitation);
    }
}