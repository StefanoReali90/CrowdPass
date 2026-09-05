package org.spring.crowdpass.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank
        String token,
        @NotBlank (message = "La password è obbligatoria")
        @Size(min = 8, max = 100)
        String newPassword,
        @NotBlank(message = "La conferma della password è obbligatoria")
        String confirmationPassword
) {
}
