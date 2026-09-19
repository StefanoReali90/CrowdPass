package org.spring.passhalo.booking.mapper;

import org.spring.passhalo.booking.dto.BookingRequest;
import org.spring.passhalo.booking.dto.BookingResponse;
import org.spring.passhalo.booking.dto.CheckInResponse;
import org.spring.passhalo.booking.entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public Booking toEntity(BookingRequest bookingRequest) {
        Booking booking = new Booking();
        booking.setName(bookingRequest.name());
        booking.setSurname(bookingRequest.surname());
        booking.setEmail(bookingRequest.email());
        booking.setPhone(bookingRequest.phone());
        booking.setMarketingConsent(bookingRequest.marketingConsent());
        return booking;

    }

    public BookingResponse toResponse(Booking booking, String qrCodeBase64) {
        BookingResponse bookingResponse = new BookingResponse(booking.getUuid(),
                booking.getName(),
                booking.getSurname(),
                booking.getEmail(),
                booking.getPhone(),
                booking.getEvent().getId(),
                booking.getEvent().getName(),
                booking.getBookingStatus(),
                booking.getCreatedAt(),
                qrCodeBase64,
                booking.getMarketingConsent());
        ;
        return bookingResponse;
    }

    public CheckInResponse toCheckInResponse(Booking booking) {
        return new CheckInResponse(booking.getEvent().getName(), booking.getName(), booking.getSurname());
    }
}
