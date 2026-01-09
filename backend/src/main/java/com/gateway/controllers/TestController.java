package com.gateway.controllers;

import com.gateway.dto.ErrorResponse;
import com.gateway.models.Merchant;
import com.gateway.repositories.MerchantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/test")
public class TestController {
    
    @Autowired
    private MerchantRepository merchantRepository;
    
    @Value("${app.test.merchant.email}")
    private String testMerchantEmail;
    
    /**
     * Test endpoint to verify merchant seeding
     */
    @GetMapping("/merchant")
    public ResponseEntity<?> getTestMerchant() {
        Optional<Merchant> merchantOpt = merchantRepository.findByEmail(testMerchantEmail);
        
        if (merchantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.create("NOT_FOUND_ERROR", "Test merchant not found"));
        }
        
        Merchant merchant = merchantOpt.get();
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", merchant.getId().toString());
        response.put("email", merchant.getEmail());
        response.put("api_key", merchant.getApiKey());
        response.put("seeded", true);
        
        return ResponseEntity.ok(response);
    }
}
