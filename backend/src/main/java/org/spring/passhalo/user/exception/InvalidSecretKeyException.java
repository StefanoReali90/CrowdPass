package org.spring.passhalo.user.exception;

import org.springframework.http.HttpStatus;

public class InvalidSecretKeyException extends PassHaloException {
    public InvalidSecretKeyException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
