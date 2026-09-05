package org.spring.crowdpass.booking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.spring.crowdpass.booking.dto.BookingRequest;
import org.spring.crowdpass.booking.dto.BookingResponse;
import org.spring.crowdpass.booking.dto.CheckInResponse;
import org.spring.crowdpass.booking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping(path = "/", consumes = "application/json", produces = "application/json")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        BookingResponse bookingResponse = bookingService.createBooking(bookingRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingResponse);
    }

    @GetMapping(path = "/{uuid}", produces = "application/json")
    public ResponseEntity<BookingResponse> getBookingByUuid(@PathVariable UUID uuid) {
        BookingResponse bookingResponse = bookingService.getBookingByUuid(uuid);
        return ResponseEntity.ok(bookingResponse);
    }

    @GetMapping(path = "/events/{eventId}", produces = "application/json")
    public ResponseEntity<List<BookingResponse>> getBookingByEventId(@PathVariable Long eventId) {
        List<BookingResponse> bookingResponse = bookingService.getBookingsByEventId(eventId);
        return ResponseEntity.ok(bookingResponse);
    }

    @GetMapping(path = "/email/{email}", produces = "application/json")
    public ResponseEntity<List<BookingResponse>> getBookingByEmail(@PathVariable String email) {
        List<BookingResponse> bookingResponse = bookingService.getBookingsByEmail(email);
        return ResponseEntity.ok(bookingResponse);
    }

    @GetMapping(path = "/event/{eventId}/email/{email}", produces = "application/json")
    public ResponseEntity<List<BookingResponse>> getBookingByEventIdAndEmail(@PathVariable Long eventId, @PathVariable String email) {
        List<BookingResponse> bookingResponse = bookingService.getBookingsByEventIdAndEmail(eventId, email);
        return ResponseEntity.ok(bookingResponse);
    }

    @GetMapping(path = "/bookingId/{bookingId}", produces = "application/json")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long bookingId) {
        BookingResponse bookingResponse = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(bookingResponse);
    }

    @GetMapping(path="/", produces = "application/json")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> bookingResponses = bookingService.getAllBookings();
        return ResponseEntity.ok(bookingResponses);
    }

    @PatchMapping(path = "/check-in/{uuid}", produces = "application/json")
    public ResponseEntity<CheckInResponse> checkInBooking(@PathVariable UUID uuid) {
        CheckInResponse checkInResponse = bookingService.checkInBooking(uuid);
        return ResponseEntity.ok(checkInResponse);
    }



    @DeleteMapping(path = "/{bookingId}", produces = "application/json")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId) {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.noContent().build();
    }
}