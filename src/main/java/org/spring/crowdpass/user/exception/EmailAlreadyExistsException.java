package org.spring.crowdpass.user.exception;

import org.springframework.http.HttpStatus;

public class EmailAlreadyExistsException extends CrowdPassException {
    public EmailAlreadyExistsException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
