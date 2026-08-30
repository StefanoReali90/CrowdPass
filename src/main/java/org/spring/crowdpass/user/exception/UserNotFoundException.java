package org.spring.crowdpass.user.exception;

import org.springframework.http.HttpStatus;

public class UserNotFoundException extends CrowdPassException {
    public UserNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
