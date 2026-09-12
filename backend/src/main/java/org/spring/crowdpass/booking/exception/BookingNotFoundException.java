package org.spring.crowdpass.booking.exception;

import org.spring.crowdpass.user.exception.CrowdPassException;
import org.springframework.http.HttpStatus;

public class BookingNotFoundException extends CrowdPassException {
    public BookingNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
