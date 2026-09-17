package org.spring.crowdpass.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @Email(message = "L'email non è valida")
        @NotBlank(message = "L'email è obbligatoria")
        String email
) {
}
