package org.spring.crowdpass.booking.mapper;

import org.spring.crowdpass.booking.dto.BookingRequest;
import org.spring.crowdpass.booking.dto.BookingResponse;
import org.spring.crowdpass.booking.entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public Booking toEntity(BookingRequest bookingRequest) {
        Booking booking = new Booking();
        booking.setName(bookingRequest.name());
        booking.setSurname(bookingRequest.surname());
        booking.setEmail(bookingRequest.email());
        booking.setPhone(bookingRequest.phone());
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
                qrCodeBase64);
        ;
        return bookingResponse;
    }
}
