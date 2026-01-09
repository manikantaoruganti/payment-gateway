package com.gateway.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @Column(length = 64)
    private String id;

    @JsonProperty("order_id")
    @Column(name = "order_id", nullable = false, length = 64)
    private String orderId;

    @JsonProperty("merchant_id")
    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    private Integer amount;
    private String currency = "INR";
    private String method;
    private String status = "processing";

    private String vpa;

    @JsonProperty("card_network")
    private String cardNetwork;

    @JsonProperty("card_last4")
    private String cardLast4;

    @JsonProperty("error_code")
    private String errorCode;

    @JsonProperty("error_description")
    private String errorDescription;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
