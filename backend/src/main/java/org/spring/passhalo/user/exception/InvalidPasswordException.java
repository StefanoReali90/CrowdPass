package org.spring.passhalo.user.exception;

import org.springframework.http.HttpStatus;

public class InvalidPasswordException extends PassHaloException {
    public InvalidPasswordException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
