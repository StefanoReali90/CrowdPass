package org.spring.crowdpass.marketing.service;

import lombok.RequiredArgsConstructor;
import org.spring.crowdpass.marketing.entity.MarketingSubscriber;
import org.spring.crowdpass.marketing.repository.MarketingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MarketingService {

    private final MarketingRepository marketingRepository;
    @Transactional
    public void registerConsent(String name, String surname, String email) {
        marketingRepository.findByEmail(email).ifPresentOrElse(
                subscriber -> {
                    if (!subscriber.isActive()) {
                        subscriber.setActive(true);
                        marketingRepository.save(subscriber);
                    }
                    subscriber.setConsentAt(LocalDateTime.now());
                },
                () -> {
                    var newSubscriber = new MarketingSubscriber();
                    newSubscriber.setConsentAt(LocalDateTime.now());
                    newSubscriber.setName(name);
                    newSubscriber.setSurname(surname);
                    newSubscriber.setEmail(email);
                    newSubscriber.setActive(true);
                    marketingRepository.save(newSubscriber);
                }
        );
    }
}
