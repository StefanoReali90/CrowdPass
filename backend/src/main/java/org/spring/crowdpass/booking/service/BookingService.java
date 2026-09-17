package org.spring.crowdpass.booking.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.spring.crowdpass.booking.dto.BookingRequest;
import org.spring.crowdpass.booking.dto.BookingResponse;
import org.spring.crowdpass.booking.dto.CheckInResponse;
import org.spring.crowdpass.booking.entity.Booking;
import org.spring.crowdpass.booking.enums.BookingStatus;
import org.spring.crowdpass.booking.exception.*;
import org.spring.crowdpass.booking.mapper.BookingMapper;
import org.spring.crowdpass.booking.repository.BookingRepository;
import org.spring.crowdpass.event.entity.Event;
import org.spring.crowdpass.event.enums.EventState;
import org.spring.crowdpass.event.exception.AccessDeniedException;
import org.spring.crowdpass.event.exception.EventNotFoundException;
import org.spring.crowdpass.event.repository.EventRepository;
import org.spring.crowdpass.marketing.service.MarketingService;
import org.spring.crowdpass.notification.service.EmailService;
import org.spring.crowdpass.booking.exception.EventFinishedException;
import org.spring.crowdpass.user.entity.User;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final EventRepository eventRepository;
    private final QrCodeService qrCodeService;
    private final EmailService emailService;
    private final MarketingService marketingService;

    @Transactional
    public BookingResponse createBooking(BookingRequest bookingRequest) {
        Booking booking = bookingMapper.toEntity(bookingRequest);
        Event event = eventRepository.findById(bookingRequest.eventId())
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + bookingRequest.eventId()));
        if (event.getEventState() == EventState.FINISHED) {
            throw new EventFinishedException("Event is finished and no more bookings are allowed");
        }
        if (bookingRepository.existsByEventIdAndEmailAndBookingStatusNot(bookingRequest.eventId(), bookingRequest.email(), BookingStatus.CANCELLED)) {
            throw new AlreadyBookedException("Booking already exists for this event and email");
        }
        if (bookingRepository.countByEventIdAndBookingStatusNot(event.getId(), BookingStatus.CANCELLED) >= event.getTotalTickets()) {
            throw new NoTicketException("No more tickets available for this event");
        }

        booking.setEvent(event);
        Booking savedBooking = bookingRepository.save(booking);
        String qrCode = qrCodeService.createQrCode(savedBooking.getUuid().toString());
        emailService.sendBookingConfirmation(savedBooking.getEmail(), savedBooking.getName(), event.getName(), qrCodeService.createQrCodeBytes(savedBooking.getUuid().toString()));
        if (bookingRequest.marketingConsent()) {
            marketingService.registerConsent(savedBooking.getName(), savedBooking.getSurname(), savedBooking.getEmail());
        }
        log.info("Booking has been created successfully for event: {}, {}, booking: {}, {}", event.getId(), event.getName(), savedBooking.getId(), savedBooking.getUuid());
        return bookingMapper.toResponse(savedBooking, qrCode);

    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByUuid(UUID uuid, User admin) {
        Booking booking = bookingRepository.findByUuid(uuid)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with uuid: " + uuid));
        Event event = booking.getEvent();
        if(event.getUser() == null || !event.getUser().getId().equals(admin.getId())) {
            throw new AccessDeniedException("User is not authorized to view this booking");
        }
        return bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString()));
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId, User admin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));
        Event event = booking.getEvent();
        if(event.getUser() == null || !event.getUser().getId().equals(admin.getId())) {
            throw new AccessDeniedException("User is not authorized to view this booking");
        }
        return bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString()));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByEventId(Long eventId, User admin) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
        if (event.getUser() == null || !event.getUser().getId().equals(admin.getId())) {
            throw new AccessDeniedException("User is not authorized to view bookings for this event");
        }
        List<Booking> bookings = bookingRepository.findAllByEventId(eventId);
        return bookings.stream()
                .map(booking -> bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByEmail(String email, User admin) {
        List<Booking> bookings = bookingRepository.findAllByEmailAndEvent_User_Id(email, admin.getId());
        return bookings.stream()
                .map(booking -> bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByEventIdAndEmail(Long eventId, String email, User admin) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
        if (event.getUser() == null || !event.getUser().getId().equals(admin.getId())) {
            throw new AccessDeniedException("User is not authorized to view bookings for this event");
        }
        List<Booking> bookings = bookingRepository.findAllByEventIdAndEmail(eventId, email);
        return bookings.stream()
                .map(booking -> bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings(User admin) {
        List<Booking> bookings = bookingRepository.findAllByEvent_User_Id(admin.getId());
        return bookings.stream()
                .map(booking -> bookingMapper.toResponse(booking, qrCodeService.createQrCode(booking.getUuid().toString())))
                .toList();
    }

    @Transactional
    public void deleteBooking(Long bookingId, User admin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));
        if(booking.getEvent() == null || booking.getEvent().getUser() == null) {
            throw new AccessDeniedException("User is not authorized to cancel this booking");
        }
        if(!booking.getEvent().getUser().getId().equals(admin.getId())) {
            throw new AccessDeniedException("User is not authorized to cancel this booking");
        }
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new AlreadyCanceledException("Booking already canceled with id: " + bookingId);
        }
        booking.setBookingStatus(BookingStatus.CANCELLED);

        log.info("Booking has been cancelled successfully: {}", booking.getUuid());
    }

    @Transactional
    public CheckInResponse checkInBooking(UUID uuid) {
        Booking booking = bookingRepository.findForCheckInByUuid(uuid).orElseThrow(() -> new BookingNotFoundException("Booking not found with uuid: " + uuid));
        if (booking.getEvent() != null && booking.getEvent().getEventState() == EventState.FINISHED) {
            throw new EventFinishedException("Event is finished and check-in is not allowed");
        }
        switch (booking.getBookingStatus()) {
            case CREATED:
                booking.setBookingStatus((BookingStatus.VALIDATED));
                booking.setCheckInDateTime(LocalDateTime.now());
                log.info("Check-in successful for booking UUID: {}", uuid);
                return bookingMapper.toCheckInResponse(booking);
            case VALIDATED:
                log.warn("Check-in rejected - Booking UUID: {} was already validated at: {}", uuid, booking.getCheckInDateTime());
                throw new AlreadyValidatedException("Booking already validated with uuid: " + uuid);


            case CANCELLED:
                log.warn("Check-in rejected - Booking UUID: {} is cancelled", uuid);
                throw new AlreadyCanceledException("Booking already canceled with uuid: " + uuid);

            default:
                throw new BookingStatusException("Booking status not valid for check-in with uuid: " + uuid);
        }
    }

    @Transactional
    public void anonymizeBookingsByEventId(Long eventId) {
        List<Booking> bookings = bookingRepository.findAllByEventId(eventId);
        for (Booking booking : bookings) {
            booking.setName("ANONYMIZED");
            booking.setSurname("ANONYMIZED");
            booking.setEmail("anon_" + booking.getUuid() + "@anonymized.local");
            booking.setPhone(null);

        }
        log.info("GDPR Anonymization completed for event ID: {} - Total bookings anonymized: {}", eventId, bookings.size());
    }



}
