package org.spring.passhalo.user.exception;

import org.springframework.http.HttpStatus;

public class EmailAlreadyExistsException extends PassHaloException {
    public EmailAlreadyExistsException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
