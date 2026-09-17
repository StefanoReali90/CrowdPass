package org.spring.crowdpass.user.dto;

public record UserResponse(
        String name,
        String surname,
        String email,
        String role
) {
}
