package org.spring.crowdpass.booking.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import org.spring.crowdpass.event.exception.EventNotFoundException;
import org.spring.crowdpass.event.repository.EventRepository;
import org.spring.crowdpass.marketing.service.MarketingService;
import org.spring.crowdpass.notification.service.EmailService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.internal.verification.VerificationModeFactory.times;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @InjectMocks
    private BookingService bookingService;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingMapper bookingMapper;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private QrCodeService qrCodeService;

    @Mock
    private EmailService emailService;

    @Mock
    private MarketingService marketingService;

    @Test
    void testCheckIn() {
        UUID bookingId = UUID.randomUUID();
        Event event = new Event();
        event.setEventState(EventState.WAITING);
        Booking booking = new Booking();
        CheckInResponse expectedResponse = new CheckInResponse("Concerto", "Mario", "Rossi");
        booking.setUuid(bookingId);
        booking.setBookingStatus(BookingStatus.CREATED);
        booking.setCheckInDateTime(null);
        booking.setEvent(event);
        when(bookingRepository.findByUuid(bookingId)).thenReturn(Optional.of(booking));
        when(bookingMapper.toCheckInResponse(booking)).thenReturn(expectedResponse);
        CheckInResponse response = bookingService.checkInBooking(bookingId);
        assertEquals(expectedResponse, response);
        assertNotNull(response);
        assertEquals(BookingStatus.VALIDATED, booking.getBookingStatus());
        assertNotNull(booking.getCheckInDateTime());
        verify(bookingRepository, times(1)).findByUuid(bookingId);

    }

    @Test
    void testCheckIn_WhenAlreadyValidated_ShouldThrowException() {
        Event event = new Event();
        event.setEventState(EventState.WAITING);
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setUuid(bookingId);
        booking.setBookingStatus(BookingStatus.VALIDATED);
        booking.setEvent(event);
        when(bookingRepository.findByUuid(bookingId)).thenReturn(Optional.of(booking));
        assertThrows(AlreadyValidatedException.class, () -> bookingService.checkInBooking(bookingId));
        verify(bookingRepository, times(1)).findByUuid(bookingId);
    }

    @Test
    void checkin_bookingNotFound_ShouldThrowException() {
        UUID uuid = UUID.randomUUID();
        Booking booking = new Booking();
        when(bookingRepository.findByUuid(uuid)).thenReturn(Optional.empty());
        assertThrows(BookingNotFoundException.class, () -> bookingService.checkInBooking(uuid));
        verify(bookingRepository, times(1)).findByUuid(uuid);
    }

    @Test
    void checkin_bookingCanceled_ShouldThrowException() {
        Event event = new Event();
        event.setEventState(EventState.WAITING);
        UUID uuid = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setUuid(uuid);
        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setEvent(event);
        when(bookingRepository.findByUuid(uuid)).thenReturn(Optional.of(booking));
        assertThrows(AlreadyCanceledException.class, () -> bookingService.checkInBooking(uuid));
        verify(bookingRepository, times(1)).findByUuid(uuid);
    }

    @Test
    void createBooking() {
        BookingRequest request = new BookingRequest("Mario", "Rossi", "mario.rossi@example.com", "1234567890", 1L, true);
        Booking booking = new Booking();
        booking.setUuid(UUID.randomUUID());
        booking.setName("Mario");
        booking.setSurname("Rossi");
        booking.setEmail("mario.rossi@example.com");
        booking.setPhone("1234567890");
        booking.setEvent(new Event());
        booking.setBookingStatus(BookingStatus.CREATED);
        BookingResponse expectedResponse = mock(BookingResponse.class);
        Event event = new Event();
        event.setId(1L);
        event.setName("Concerto");
        event.setTotalTickets(300);
        when(bookingMapper.toEntity(request)).thenReturn(new Booking());
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(bookingRepository.existsByEventIdAndEmailAndBookingStatusNot(1L, "mario.rossi@example.com", BookingStatus.CANCELLED)).thenReturn(false);
        when(bookingRepository.countByEventIdAndBookingStatusNot(1L, BookingStatus.CANCELLED)).thenReturn(0L);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(qrCodeService.createQrCode(anyString())).thenReturn("mock-qr-base64");
        when(qrCodeService.createQrCodeBytes(anyString())).thenReturn(new byte[]{1, 2, 3});
        when(bookingMapper.toResponse(eq(booking), anyString())).thenReturn(expectedResponse);
        BookingResponse response = bookingService.createBooking(request);
        assertNotNull(response);
        assertEquals(expectedResponse, response);
        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(emailService, times(1)).sendBookingConfirmation(any(), any(), any(), any());
        verify(marketingService, times(1)).registerConsent(any(), any(), any());

    }

    @Test
    void createBooking_WhenEventNotFound_ShouldThrowException() {
        BookingRequest request = new BookingRequest("Mario", "Rossi", "mario.rossi@example.com", "1234567890", 1L, true);
        when(bookingMapper.toEntity(request)).thenReturn(new Booking());
        when(eventRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EventNotFoundException.class, () -> bookingService.createBooking(request));
    }

    @Test
    void createBooking_WhenAlreadyBooked_ShouldThrowException() {
        BookingRequest request = new BookingRequest("Mario", "Rossi", "mario.rossi@example.com", "1234567890", 1L, true);
        when(bookingMapper.toEntity(request)).thenReturn(new Booking());
        when(eventRepository.findById(1L)).thenReturn(Optional.of(new Event()));
        when(bookingRepository.existsByEventIdAndEmailAndBookingStatusNot(1L, "mario.rossi@example.com", BookingStatus.CANCELLED)).thenReturn(true);
        assertThrows(AlreadyBookedException.class, () -> bookingService.createBooking(request));
    }

    @Test
    void createBooking_WhenNoTicketsAvailable_ShouldThrowException() {
        BookingRequest request = new BookingRequest("Mario", "Rossi", "mario.rossi@example.com", "1234567890", 1L, true);
        Event event = new Event();
        event.setId(1L);
        event.setTotalTickets(100);
        when(bookingMapper.toEntity(request)).thenReturn(new Booking());
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(bookingRepository.existsByEventIdAndEmailAndBookingStatusNot(1L, "mario.rossi@example.com", BookingStatus.CANCELLED)).thenReturn(false);
        when(bookingRepository.countByEventIdAndBookingStatusNot(1L, BookingStatus.CANCELLED)).thenReturn(300L);
        assertThrows(NoTicketException.class, () -> bookingService.createBooking(request));
    }

    @Test
    void deleteBooking() {
        Long bookingId = 1L;
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setBookingStatus(BookingStatus.CREATED);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        bookingService.deleteBooking(bookingId);
        assertEquals(BookingStatus.CANCELLED, booking.getBookingStatus());
        verify(bookingRepository, times(1)).findById(bookingId);
    }

    @Test
    void anonymizeBooking() {
        Long eventId = 1L;
        Booking booking = new Booking();
        booking.setBookingStatus(BookingStatus.CREATED);
        booking.setUuid(UUID.randomUUID());
        when(bookingRepository.findAllByEventId(eventId)).thenReturn(List.of(booking));
        bookingService.anonymizeBookingsByEventId(eventId);
        assertEquals("ANONYMIZED", booking.getName());
        assertEquals("ANONYMIZED", booking.getSurname());
        assertEquals("anon_" + booking.getUuid() + "@anonymized.local", booking.getEmail());
        assertNull(booking.getPhone());
        verify(bookingRepository, times(1)).findAllByEventId(eventId);
    }

    @Test
    void testCheckIn_WhenEventFinished_ShouldThrowException() {
        UUID bookingId = UUID.randomUUID();
        Event event = new Event();
        event.setEventState(EventState.FINISHED);
        Booking booking = new Booking();
        booking.setUuid(bookingId);
        booking.setBookingStatus(BookingStatus.CREATED);
        booking.setCheckInDateTime(null);
        booking.setEvent(event);
        when(bookingRepository.findByUuid(bookingId)).thenReturn(Optional.of(booking));
        assertThrows(EventFinishedException.class, () -> bookingService.checkInBooking(bookingId));
        verify(bookingRepository, times(1)).findByUuid(bookingId);
    }
}

