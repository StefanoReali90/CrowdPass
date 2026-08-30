package org.spring.crowdpass.user.exception;

import org.springframework.http.HttpStatus;

public class TokenExpiredException extends CrowdPassException {
    public TokenExpiredException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
