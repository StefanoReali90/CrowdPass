package org.spring.passhalo.event.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class EventFaq {

    @Column(nullable = false, length = 160)
    private String question;
    @Column(nullable = false,length = 1200)
    private String answer;
}
