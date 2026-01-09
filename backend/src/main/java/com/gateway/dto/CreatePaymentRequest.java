package com.gateway.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CreatePaymentRequest {

    @JsonProperty("order_id")
    private String orderId;

    private String method;
    private String vpa;
    private CardDetails card;

    public String getOrderId() { return orderId; }
    public String getMethod() { return method; }
    public String getVpa() { return vpa; }
    public CardDetails getCard() { return card; }

    public static class CardDetails {

        private String number;

        @JsonProperty("expiry_month")
        private Integer expiryMonth;

        @JsonProperty("expiry_year")
        private Integer expiryYear;

        private String cvv;

        @JsonProperty("holder_name")
        private String holderName;

        public String getNumber() { return number; }
        public Integer getExpiryMonth() { return expiryMonth; }
        public Integer getExpiryYear() { return expiryYear; }
        public String getCvv() { return cvv; }
        public String getHolderName() { return holderName; }
    }
}
