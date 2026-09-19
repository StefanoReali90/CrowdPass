package org.spring.passhalo.booking.dto;

import org.spring.passhalo.booking.entity.Booking;
import org.spring.passhalo.booking.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record BookingResponse(
        UUID uuid,
        String name,
        String surname,
        String email,
        String phone,
        Long eventId,
        String eventName,
        BookingStatus bookingStatus,
        LocalDateTime createdAt,
        String qrCodeBase64,
        boolean marketingConsent

) {
}
