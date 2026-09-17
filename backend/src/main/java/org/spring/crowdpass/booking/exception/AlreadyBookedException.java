package org.spring.crowdpass.booking.exception;

import org.spring.crowdpass.user.exception.CrowdPassException;
import org.springframework.http.HttpStatus;

public class AlreadyBookedException extends CrowdPassException {
    public AlreadyBookedException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
