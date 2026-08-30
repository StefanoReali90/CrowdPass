package org.spring.crowdpass.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

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
        Double bookingPrice


) {
}
