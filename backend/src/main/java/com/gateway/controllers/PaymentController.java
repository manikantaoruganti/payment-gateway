package com.gateway.controllers;

import com.gateway.dto.CreatePaymentRequest;
import com.gateway.dto.ErrorResponse;
import com.gateway.models.Merchant;
import com.gateway.models.Order;
import com.gateway.models.Payment;
import com.gateway.repositories.MerchantRepository;
import com.gateway.services.OrderService;
import com.gateway.services.PaymentService;
import com.gateway.services.ValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ValidationService validationService;

    @Autowired
    private MerchantRepository merchantRepository;

    /* ================= CREATE PAYMENT (AUTH) ================= */

    @PostMapping
    public ResponseEntity<?> createPayment(
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestHeader(value = "X-Api-Secret", required = false) String apiSecret,
            @RequestBody CreatePaymentRequest request) {

        Merchant merchant = authenticateMerchant(apiKey, apiSecret);
        if (merchant == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.create(
                            "AUTHENTICATION_ERROR",
                            "Invalid API credentials"
                    ));
        }

        if (request.getOrderId() == null || request.getOrderId().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ErrorResponse.create(
                            "BAD_REQUEST_ERROR",
                            "order_id is required"
                    ));
        }

        Order order = orderService.getOrder(request.getOrderId());
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.create(
                            "NOT_FOUND_ERROR",
                            "Order not found"
                    ));
        }

        if (!order.getMerchantId().equals(merchant.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ErrorResponse.create(
                            "BAD_REQUEST_ERROR",
                            "Order does not belong to merchant"
                    ));
        }

        if (request.getMethod() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ErrorResponse.create(
                            "BAD_REQUEST_ERROR",
                            "Payment method is required"
                    ));
        }

        /* ---------- UPI ---------- */
        if ("upi".equals(request.getMethod())) {

            if (!validationService.isValidVpa(request.getVpa())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ErrorResponse.create(
                                "INVALID_VPA",
                                "Invalid VPA format"
                        ));
            }

        /* ---------- CARD ---------- */
        } else if ("card".equals(request.getMethod())) {

            CreatePaymentRequest.CardDetails card = request.getCard();
            if (card == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ErrorResponse.create(
                                "BAD_REQUEST_ERROR",
                                "Card details are required"
                        ));
            }

            if (!validationService.isValidCard(card)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ErrorResponse.create(
                                "INVALID_CARD",
                                "Invalid card"
                        ));
            }

            if (card.getCvv() == null || card.getHolderName() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ErrorResponse.create(
                                "BAD_REQUEST_ERROR",
                                "CVV and cardholder name are required"
                        ));
            }

        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ErrorResponse.create(
                            "BAD_REQUEST_ERROR",
                            "Invalid payment method"
                    ));
        }

        Payment payment = paymentService.createAndProcessPayment(request, order);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    /* ================= GET PAYMENT ================= */

    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(
            @PathVariable String paymentId,
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestHeader(value = "X-Api-Secret", required = false) String apiSecret
    ) {

        Merchant merchant = authenticateMerchant(apiKey, apiSecret);
        if (merchant == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErrorResponse.create(
                            "AUTHENTICATION_ERROR",
                            "Invalid API credentials"
                    ));
        }

        Payment payment = paymentService.getPayment(paymentId);
        if (payment == null || !payment.getMerchantId().equals(merchant.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.create(
                            "NOT_FOUND_ERROR",
                            "Payment not found"
                    ));
        }

        return ResponseEntity.ok(payment);
    }

    /* ================= AUTH ================= */

    private Merchant authenticateMerchant(String apiKey, String apiSecret) {
        if (apiKey == null || apiSecret == null) return null;

        Optional<Merchant> merchantOpt = merchantRepository.findByApiKey(apiKey);
        if (merchantOpt.isEmpty()) return null;

        Merchant merchant = merchantOpt.get();
        return merchant.getApiSecret().equals(apiSecret) ? merchant : null;
    }
}
