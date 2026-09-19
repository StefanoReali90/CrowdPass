package org.spring.passhalo.event.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public record EventRequest(
        @NotBlank
        String name,
        @NotBlank
        String description,
        @NotBlank
        String location,
        @NotNull
        LocalDateTime start,
        @NotNull
        LocalDateTime end,
        @NotBlank
        String imageUrl,
        @NotNull
        @Positive
        Integer totalTickets,
        @NotNull
        @Positive
        Double normalPrice,
        @NotNull
        @Positive
        Double bookingPrice,
        @Size(max=2048)
        String videoUrl,
        @Size(max = 12)
        @Valid
        List<EventFaqDTO> faqs


) {
}
