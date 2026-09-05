package org.spring.crowdpass.user.exception;

import org.springframework.http.HttpStatus;

public class InvalidPasswordException extends CrowdPassException {
    public InvalidPasswordException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
