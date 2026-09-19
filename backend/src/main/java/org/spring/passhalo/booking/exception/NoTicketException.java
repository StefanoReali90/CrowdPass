package org.spring.passhalo.booking.exception;

import org.spring.passhalo.user.exception.PassHaloException;
import org.springframework.http.HttpStatus;

public class NoTicketException extends PassHaloException {
    public NoTicketException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
