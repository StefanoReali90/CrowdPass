package org.spring.crowdpass.booking.service;

import lombok.RequiredArgsConstructor;
import org.spring.crowdpass.booking.dto.BookingRequest;
import org.spring.crowdpass.booking.dto.BookingResponse;
import org.spring.crowdpass.booking.entity.Booking;
import org.spring.crowdpass.booking.exception.AlreadyBookedException;
import org.spring.crowdpass.booking.exception.NoTicketException;
import org.spring.crowdpass.booking.mapper.BookingMapper;
import org.spring.crowdpass.booking.repository.BookingRepository;
import org.spring.crowdpass.event.EventRepository;
import org.spring.crowdpass.event.entity.Event;
import org.spring.crowdpass.event.exception.EventNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final EventRepository eventRepository;
    private final QrCodeService qrCodeService;

    @Transactional
    public BookingResponse createBooking(BookingRequest bookingRequest) {
        Booking booking = bookingMapper.toEntity(bookingRequest);
        Event event = eventRepository.findById(bookingRequest.eventId())
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + bookingRequest.eventId()));
        if (bookingRepository.existsByEventIdAndEmail(bookingRequest.eventId(), bookingRequest.email())) {
            throw new AlreadyBookedException("Booking already exists for this event and email");
        }
        if (bookingRepository.countByEventId(event.getId()) >= event.getTotalTickets()) {
            throw new NoTicketException("No more tickets available for this event");
        }
        booking.setEvent(event);
        Booking savedBooking = bookingRepository.save(booking);
        String qrCode = qrCodeService.createQrCode(savedBooking.getUuid().toString());
        return bookingMapper.toResponse(savedBooking, qrCode);

    }
}
