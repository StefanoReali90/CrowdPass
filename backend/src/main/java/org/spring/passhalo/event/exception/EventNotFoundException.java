package org.spring.passhalo.event.exception;

import org.spring.passhalo.user.exception.PassHaloException;
import org.springframework.http.HttpStatus;

public class EventNotFoundException extends PassHaloException {
    public EventNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
