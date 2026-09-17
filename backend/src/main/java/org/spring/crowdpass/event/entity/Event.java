package org.spring.crowdpass.event.entity;

import jakarta.persistence.*;
import lombok.*;
import org.spring.crowdpass.event.enums.EventState;
import org.spring.crowdpass.user.entity.User;

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
    private LocalDateTime startDateTime;

    @Column(nullable = false)
    private LocalDateTime endDateTime;

    @Column(nullable = true)
    private Double normalPrice;

    @Column(nullable = false)
    private Double bookingPrice;

    @Column(nullable = false)
    private int totalTickets;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventState eventState;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private int walkInCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;



}
