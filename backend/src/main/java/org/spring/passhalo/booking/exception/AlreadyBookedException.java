package org.spring.passhalo.booking.exception;

import org.spring.passhalo.user.exception.PassHaloException;
import org.springframework.http.HttpStatus;

public class AlreadyBookedException extends PassHaloException {
    public AlreadyBookedException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
