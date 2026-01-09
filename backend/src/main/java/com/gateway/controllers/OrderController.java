package com.gateway.controllers;

import com.gateway.dto.CreateOrderRequest;
import com.gateway.dto.ErrorResponse;
import com.gateway.models.Merchant;
import com.gateway.models.Order;
import com.gateway.repositories.MerchantRepository;
import com.gateway.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private MerchantRepository merchantRepository;
    
    /**
     * Create a new order
     */
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestHeader(value = "X-Api-Secret", required = false) String apiSecret,
            @RequestBody CreateOrderRequest request) {
        
        // Authenticate merchant
        Merchant merchant = authenticateMerchant(apiKey, apiSecret);
        if (merchant == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.create("AUTHENTICATION_ERROR", "Invalid API credentials"));
        }
        
        // Validate amount
        if (request.getAmount() == null || request.getAmount() < 100) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ErrorResponse.create("BAD_REQUEST_ERROR", "amount must be at least 100"));
        }
        
        // Create order
        Order order = orderService.createOrder(request, merchant.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
    
    /**
     * Get order by ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestHeader(value = "X-Api-Secret", required = false) String apiSecret,
            @PathVariable String orderId) {
        
        // Authenticate merchant
        Merchant merchant = authenticateMerchant(apiKey, apiSecret);
        if (merchant == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.create("AUTHENTICATION_ERROR", "Invalid API credentials"));
        }
        
        // Get order
        Order order = orderService.getOrder(orderId);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.create("NOT_FOUND_ERROR", "Order not found"));
        }
        
        // Verify order belongs to merchant
        if (!order.getMerchantId().equals(merchant.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.create("NOT_FOUND_ERROR", "Order not found"));
        }
        
        return ResponseEntity.ok(order);
    }
    
    /**
     * Get order by ID (public endpoint for checkout page)
     */
    @GetMapping("/{orderId}/public")
    public ResponseEntity<?> getOrderPublic(@PathVariable String orderId) {
        Order order = orderService.getOrder(orderId);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.create("NOT_FOUND_ERROR", "Order not found"));
        }
        
        return ResponseEntity.ok(order);
    }
    
    /**
     * Authenticate merchant using API key and secret
     */
    private Merchant authenticateMerchant(String apiKey, String apiSecret) {
        if (apiKey == null || apiSecret == null) {
            return null;
        }
        
        Optional<Merchant> merchantOpt = merchantRepository.findByApiKey(apiKey);
        if (merchantOpt.isEmpty()) {
            return null;
        }
        
        Merchant merchant = merchantOpt.get();
        if (!merchant.getApiSecret().equals(apiSecret)) {
            return null;
        }
        
        return merchant;
    }
}
