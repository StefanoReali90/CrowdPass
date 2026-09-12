package org.spring.crowdpass.booking.exception;

import org.spring.crowdpass.user.exception.CrowdPassException;
import org.springframework.http.HttpStatus;

public class NoTicketException extends CrowdPassException {
    public NoTicketException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
