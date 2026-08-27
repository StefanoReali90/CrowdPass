package org.spring.crowdpass.user.dto;

public record UserResponse(
        String nome,
        String cognome,
        String email,
        String role
) {
}
