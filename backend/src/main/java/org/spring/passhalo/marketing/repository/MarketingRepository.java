package org.spring.passhalo.marketing.repository;

import org.spring.passhalo.marketing.entity.MarketingSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MarketingRepository extends JpaRepository<MarketingSubscriber, Long> {
    boolean existsByEmail(String email);
    Optional<MarketingSubscriber> findByEmail(String email);
}
