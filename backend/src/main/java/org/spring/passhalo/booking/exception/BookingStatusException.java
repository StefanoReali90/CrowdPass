package org.spring.passhalo.booking.exception;

import org.spring.passhalo.user.exception.PassHaloException;
import org.springframework.http.HttpStatus;

public class BookingStatusException extends PassHaloException {
    public BookingStatusException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
