package org.spring.crowdpass.event.exception;


import org.spring.crowdpass.user.exception.CrowdPassException;
import org.springframework.http.HttpStatus;

public class InvalidDateException extends CrowdPassException {
    public InvalidDateException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
