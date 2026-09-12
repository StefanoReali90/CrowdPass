package org.spring.crowdpass.event.exception;

import org.spring.crowdpass.user.exception.CrowdPassException;
import org.springframework.http.HttpStatus;

public class EventNotFoundException extends CrowdPassException {
    public EventNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
