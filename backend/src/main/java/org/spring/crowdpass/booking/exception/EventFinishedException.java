package org.spring.crowdpass.booking.exception;

import org.spring.crowdpass.user.exception.CrowdPassException;
import org.springframework.http.HttpStatus;

public class EventFinishedException extends CrowdPassException {
    public EventFinishedException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
