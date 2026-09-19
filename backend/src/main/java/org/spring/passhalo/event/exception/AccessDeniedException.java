package org.spring.passhalo.event.exception;

import org.spring.passhalo.user.exception.PassHaloException;
import org.springframework.http.HttpStatus;

public class AccessDeniedException extends PassHaloException {
    public AccessDeniedException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}
