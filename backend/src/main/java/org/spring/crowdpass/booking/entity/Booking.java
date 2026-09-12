package org.spring.crowdpass.booking.entity;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.spring.crowdpass.booking.enums.BookingStatus;
import org.spring.crowdpass.event.entity.Event;
import org.spring.crowdpass.event.enums.EventState;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@NoArgsConstructor
@Setter
@Getter
@EqualsAndHashCode
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String surname;

    @Column(nullable = false)
    private String email;

    @Column(nullable = true)
    private String phone;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BookingStatus bookingStatus = BookingStatus.CREATED;

    @Column(nullable = true)
    private LocalDateTime checkInDateTime;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean marketingConsent = false;

    @Column(nullable = false)
    private Timestamp consentAt = new Timestamp(System.currentTimeMillis());

    @PrePersist
    public void prePersist() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.consentAt == null) {
            this.consentAt = new Timestamp(System.currentTimeMillis());
        }
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;


}
