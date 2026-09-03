package org.spring.crowdpass.booking.repository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.spring.crowdpass.booking.entity.Booking;
import org.spring.crowdpass.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByUuid(UUID uuid);

    boolean existsByEventIdAndEmailAndBookingStatusNot(Long eventId, String email, BookingStatus bookingStatus);

    long countByEventId(Long eventId);
    long countByEventIdAndBookingStatusNot(Long eventId, BookingStatus bookingStatus);
    List<Booking> findAllByEventId(Long eventId);
    List<Booking> findAllByEmail(String email);
    List<Booking> findAllByEventIdAndEmail(Long eventId, String email);
}
