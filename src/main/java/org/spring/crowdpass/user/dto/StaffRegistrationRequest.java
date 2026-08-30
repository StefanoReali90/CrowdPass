package org.spring.crowdpass.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StaffRegistrationRequest(
        @NotBlank(message = "Il nome è obbligatorio")
        String nome,
        @NotBlank(message = "Il cognome è obbligatorio")
        String cognome,
        @NotBlank(message = "L'email è obbligatoria")
        @Email(message = "Formato email non valido")
        String email,
        @NotBlank(message = "La password è obbligatoria")
        @Size(min = 8, max = 100)
        String password
) {
}
