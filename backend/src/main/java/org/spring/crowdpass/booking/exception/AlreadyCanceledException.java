package org.spring.crowdpass.booking.exception;

import org.spring.crowdpass.user.exception.CrowdPassException;
import org.springframework.http.HttpStatus;

public class AlreadyCanceledException extends CrowdPassException {
    public AlreadyCanceledException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
