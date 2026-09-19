package org.spring.passhalo.booking.exception;

import org.spring.passhalo.user.exception.PassHaloException;
import org.springframework.http.HttpStatus;

public class EventFinishedException extends PassHaloException {
    public EventFinishedException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
