package org.spring.passhalo.user.dto;

public record UserResponse(
        String name,
        String surname,
        String email,
        String role
) {
}
