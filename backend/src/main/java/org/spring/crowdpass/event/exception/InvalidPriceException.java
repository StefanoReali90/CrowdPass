package org.spring.crowdpass.event.exception;

import org.spring.crowdpass.user.exception.CrowdPassException;
import org.springframework.http.HttpStatus;

public class InvalidPriceException extends CrowdPassException {
    public InvalidPriceException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
