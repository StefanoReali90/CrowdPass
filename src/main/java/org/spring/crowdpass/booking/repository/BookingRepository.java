package org.spring.crowdpass.booking.repository;

import jakarta.validation.constraints.Email;
import org.spring.crowdpass.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByUuid(UUID uuid);
    boolean existsByEventIdAndEmail(Long eventId, String email);
    long countByEventId(Long eventId);


}
