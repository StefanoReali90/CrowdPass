package org.spring.passhalo.booking.exception;

import org.spring.passhalo.user.exception.PassHaloException;
import org.springframework.http.HttpStatus;

public class BookingNotFoundException extends PassHaloException {
    public BookingNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
