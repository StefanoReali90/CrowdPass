package org.spring.crowdpass.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "La vecchia password è obbligatoria")
        String oldPassword,
        @NotBlank(message = "La nuova password è obbligatoria")
        @Size(min = 8, max = 100, message = "La nuova password deve essere lunga almeno 8 caratteri e al massimo 100 caratteri")
        String newPassword,
        @NotBlank(message = "La conferma della password è obbligatoria")
        String confirmationPassword

) {
}
