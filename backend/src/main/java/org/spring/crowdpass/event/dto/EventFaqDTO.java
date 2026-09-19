package org.spring.crowdpass.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EventFaqDTO(
        @NotBlank
        @Size(max = 160)
        String question,
        @Size(max = 1200)
        @NotBlank
        String answer
) {
}
