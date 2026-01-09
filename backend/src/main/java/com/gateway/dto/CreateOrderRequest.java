package com.gateway.dto;

import lombok.Data;
import java.util.Map;

@Data
public class CreateOrderRequest {
    private Integer amount;
    private String currency = "INR";
    private String receipt;
    private Map<String, Object> notes;
}
