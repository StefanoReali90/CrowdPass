package org.spring.passhalo.user.exception;

import org.springframework.http.HttpStatus;

public abstract class PassHaloException extends RuntimeException {
    private final HttpStatus status;

    public PassHaloException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}

