package com.gateway;

import com.gateway.models.Merchant;
import com.gateway.repositories.MerchantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;
import java.util.UUID;

@SpringBootApplication
public class PaymentGatewayApplication {

    @Value("${app.test.merchant.id}")
    private String testMerchantId;

    @Value("${app.test.merchant.email}")
    private String testMerchantEmail;

    @Value("${app.test.merchant.name}")
    private String testMerchantName;

    @Value("${app.test.merchant.api-key}")
    private String testApiKey;

    @Value("${app.test.merchant.api-secret}")
    private String testApiSecret;

    public static void main(String[] args) {
        SpringApplication.run(PaymentGatewayApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedTestMerchant(MerchantRepository merchantRepository) {
        return args -> {
            // Check if test merchant already exists
            if (!merchantRepository.existsByEmail(testMerchantEmail)) {
                Merchant testMerchant = new Merchant();
                testMerchant.setId(UUID.fromString(testMerchantId));
                testMerchant.setName(testMerchantName);
                testMerchant.setEmail(testMerchantEmail);
                testMerchant.setApiKey(testApiKey);
                testMerchant.setApiSecret(testApiSecret);
                testMerchant.setIsActive(true);
                testMerchant.setCreatedAt(LocalDateTime.now());
                testMerchant.setUpdatedAt(LocalDateTime.now());
                
                merchantRepository.save(testMerchant);
                System.out.println("Test merchant seeded successfully: " + testMerchantEmail);
            } else {
                System.out.println("Test merchant already exists: " + testMerchantEmail);
            }
        };
    }
}
