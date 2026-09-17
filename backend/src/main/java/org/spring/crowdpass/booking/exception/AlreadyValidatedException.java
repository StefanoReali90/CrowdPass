package org.spring.crowdpass.booking.exception;

import org.spring.crowdpass.user.exception.CrowdPassException;
import org.springframework.http.HttpStatus;

public class AlreadyValidatedException extends CrowdPassException {
    public AlreadyValidatedException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
