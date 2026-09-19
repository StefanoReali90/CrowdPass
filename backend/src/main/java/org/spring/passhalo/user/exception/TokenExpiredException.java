package org.spring.passhalo.user.exception;

import org.springframework.http.HttpStatus;

public class TokenExpiredException extends PassHaloException {
    public TokenExpiredException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
