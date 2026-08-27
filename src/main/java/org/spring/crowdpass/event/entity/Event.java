package org.spring.crowdpass.event.entity;

import jakarta.persistence.*;
import lombok.*;
import org.spring.crowdpass.event.enums.EventState;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Setter
@Getter
@EqualsAndHashCode
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(nullable = false)
    private Double normalPrice;

    @Column(nullable = false)
    private Double bookingPrice;

    @Column(nullable = false)
    private int totalTickets;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventState eventState;


}
