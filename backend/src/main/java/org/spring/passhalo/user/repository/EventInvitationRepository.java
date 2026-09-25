package org.spring.passhalo.user.repository;

import org.spring.passhalo.user.entity.EventInvitation;
import org.spring.passhalo.user.enums.InviteState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventInvitationRepository extends JpaRepository<EventInvitation, Long> {
    Optional<EventInvitation> findByTokenHash(String tokenHash);
    boolean existsByEventIdAndRecipientEmailAndInviteStateAndExpiresAtAfter(Long eventId, String recipientEmail, InviteState inviteState, LocalDateTime now);
    Optional<EventInvitation> findByIdAndEventId(Long id, Long eventId);
    List<EventInvitation> findAllByEventIdAndInviteState(Long eventId, InviteState inviteState);
    List<EventInvitation> findAllByInviteStateAndExpiresAtBefore(InviteState inviteState, LocalDateTime expiresAt);

}
