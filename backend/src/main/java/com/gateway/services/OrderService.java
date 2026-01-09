package com.gateway.services;

import com.gateway.dto.CreateOrderRequest;
import com.gateway.models.Order;
import com.gateway.repositories.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.UUID;

@Service
public class OrderService {

    private static final String ORDER_PREFIX = "order_";
    private static final int ID_LENGTH = 16;
    private static final String ALPHANUMERIC =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom random = new SecureRandom();

    @Autowired
    private OrderRepository orderRepository;

    public String generateOrderId() {
        String id;
        do {
            StringBuilder sb = new StringBuilder(ORDER_PREFIX);
            for (int i = 0; i < ID_LENGTH; i++) {
                sb.append(ALPHANUMERIC.charAt(
                        random.nextInt(ALPHANUMERIC.length())));
            }
            id = sb.toString();
        } while (orderRepository.existsById(id));
        return id;
    }

    public Order createOrder(CreateOrderRequest request, UUID merchantId) {
        Order order = new Order();
        order.setId(generateOrderId());
        order.setMerchantId(merchantId);
        order.setAmount(request.getAmount());
        order.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        order.setReceipt(request.getReceipt());
        order.setNotes(request.getNotes());
        order.setStatus("created");
        return orderRepository.save(order);
    }

    public Order getOrder(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            throw new ApiException("BAD_REQUEST_ERROR", "order_id is required");
        }

        return orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ApiException("NOT_FOUND_ERROR", "Order not found"));
    }
}
