package org.spring.passhalo.user.exception;

import org.springframework.http.HttpStatus;

public class UserNotFoundException extends PassHaloException {
    public UserNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
