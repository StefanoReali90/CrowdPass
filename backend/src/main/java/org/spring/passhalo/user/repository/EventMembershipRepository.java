package org.spring.passhalo.user.repository;

import org.spring.passhalo.user.entity.EventMembership;
import org.spring.passhalo.user.enums.MembershipState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventMembershipRepository extends JpaRepository<EventMembership, Long> {
    Optional<EventMembership> findByEventIdAndCollaboratorId(Long eventId, Long collaboratorId);

    List<EventMembership> findByEventIdAndMembershipState(Long eventId, MembershipState membershipState);

    List<EventMembership> findByCollaboratorIdAndMembershipState(Long collaboratorId, MembershipState membershipState);

}
