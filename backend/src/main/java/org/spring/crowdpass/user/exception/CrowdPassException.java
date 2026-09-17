package org.spring.crowdpass.user.exception;

import org.springframework.http.HttpStatus;

public abstract class CrowdPassException extends RuntimeException {
    private final HttpStatus status;

    public CrowdPassException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}

