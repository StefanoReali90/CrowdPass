package org.spring.crowdpass.booking.service;

import lombok.RequiredArgsConstructor;
import org.spring.crowdpass.booking.dto.BookingRequest;
import org.spring.crowdpass.booking.dto.BookingResponse;
import org.spring.crowdpass.booking.entity.Booking;
import org.spring.crowdpass.booking.enums.BookingStatus;
import org.spring.crowdpass.booking.exception.AlreadyBookedException;
import org.spring.crowdpass.booking.exception.BookingNotFoundException;
import org.spring.crowdpass.booking.exception.NoTicketException;
import org.spring.crowdpass.booking.mapper.BookingMapper;
import org.spring.crowdpass.booking.repository.BookingRepository;
import org.spring.crowdpass.event.EventRepository;
import org.spring.crowdpass.event.entity.Event;
import org.spring.crowdpass.event.exception.EventNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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
        if (bookingRepository.existsByEventIdAndEmailAndBookingStatusNot(bookingRequest.eventId(), bookingRequest.email(), BookingStatus.CANCELLED)) {
            throw new AlreadyBookedException("Booking already exists for this event and email");
        }
        if (bookingRepository.countByEventIdAndBookingStatusNot(event.getId(), BookingStatus.CANCELLED) >= event.getTotalTickets()) {
            throw new NoTicketException("No more tickets available for this event");
        }
        booking.setEvent(event);
        Booking savedBooking = bookingRepository.save(booking);
        String qrCode = qrCodeService.createQrCode(savedBooking.getUuid().toString());
        return bookingMapper.toResponse(savedBooking, qrCode);

    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByUuid(UUID uuid) {
        Booking booking = bookingRepository.findByUuid(uuid)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with uuid: " + uuid));
        return bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString()));
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));
        return bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString()));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByEventId(Long eventId) {
        List<Booking> bookings = bookingRepository.findAllByEventId(eventId);
        return bookings.stream()
                .map(booking -> bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByEmail(String email) {
        List<Booking> findAllByEmail = bookingRepository.findAllByEmail(email);
        return findAllByEmail.stream()
                .map(booking -> bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByEventIdAndEmail(Long eventId, String email) {
        List<Booking> bookings = bookingRepository.findAllByEventIdAndEmail(eventId, email);
        return bookings.stream()
                .map(booking -> bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(booking -> bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString())))
                .toList();
    }

    @Transactional
    public void deleteBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));
        booking.setBookingStatus(BookingStatus.CANCELLED);

    }
}
