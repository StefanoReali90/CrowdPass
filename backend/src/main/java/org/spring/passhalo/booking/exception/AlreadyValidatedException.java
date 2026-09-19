package org.spring.passhalo.booking.exception;

import org.spring.passhalo.user.exception.PassHaloException;
import org.springframework.http.HttpStatus;

public class AlreadyValidatedException extends PassHaloException {
    public AlreadyValidatedException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
