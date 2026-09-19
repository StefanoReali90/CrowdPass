package org.spring.passhalo.event.exception;

import org.spring.passhalo.user.exception.PassHaloException;
import org.springframework.http.HttpStatus;

public class InvalidPriceException extends PassHaloException {
    public InvalidPriceException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
