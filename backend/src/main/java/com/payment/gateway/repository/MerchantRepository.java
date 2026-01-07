package com.payment.gateway.repository;

import com.payment.gateway.entity.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MerchantRepository extends JpaRepository<Merchant, Long> {
    Optional<Merchant> findByMerchantId(String merchantId);
    Optional<Merchant> findByApiKey(String apiKey);
    Optional<Merchant> findByBusinessEmail(String email);
}
