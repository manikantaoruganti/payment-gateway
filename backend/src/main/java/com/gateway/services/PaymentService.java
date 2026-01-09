package com.gateway.services;

import com.gateway.dto.CreatePaymentRequest;
import com.gateway.models.Order;
import com.gateway.models.Payment;
import com.gateway.repositories.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ValidationService validationService;

    /* ================= CREATE PAYMENT ================= */

    public Payment createAndProcessPayment(CreatePaymentRequest req, Order order) {

        Payment payment = new Payment();
        payment.setId("pay_" + System.nanoTime());
        payment.setOrderId(order.getId());
        payment.setMerchantId(order.getMerchantId());
        payment.setAmount(order.getAmount());
        payment.setCurrency(order.getCurrency());
        payment.setMethod(req.getMethod());
        payment.setStatus("processing");

        /* ---------- UPI ---------- */
        if ("upi".equals(req.getMethod())) {

            if (!validationService.isValidVpa(req.getVpa())) {
                throw new ApiException("BAD_REQUEST_ERROR", "Invalid VPA");
            }

            payment.setVpa(req.getVpa());
        }

        /* ---------- CARD ---------- */
        else if ("card".equals(req.getMethod())) {

            CreatePaymentRequest.CardDetails card = req.getCard();

            if (!validationService.isValidCard(card)) {
                throw new ApiException("BAD_REQUEST_ERROR", "Invalid card");
            }

            payment.setCardNetwork(
                    validationService.detectCardNetwork(card.getNumber())
            );
            payment.setCardLast4(
                    validationService.getCardLast4(card.getNumber())
            );
        }

        return paymentRepository.save(payment);
    }

    /* ================= GET PAYMENT ================= */

    public Payment getPayment(String paymentId) {
        if (paymentId == null || paymentId.isBlank()) {
            return null;
        }
        return paymentRepository.findById(paymentId).orElse(null);
    }
}
