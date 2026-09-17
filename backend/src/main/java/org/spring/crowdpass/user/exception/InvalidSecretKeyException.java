package org.spring.crowdpass.user.exception;

import org.springframework.http.HttpStatus;

public class InvalidSecretKeyException extends CrowdPassException {
    public InvalidSecretKeyException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
