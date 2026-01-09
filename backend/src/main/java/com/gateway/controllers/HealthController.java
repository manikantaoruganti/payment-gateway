package com.gateway.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {
    
    @Autowired
    private DataSource dataSource;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        
        // Check database connectivity
        try (Connection conn = dataSource.getConnection()) {
            response.put("database", "connected");
        } catch (Exception e) {
            response.put("database", "disconnected");
        }
        
        // Add timestamp in ISO 8601 format
        response.put("timestamp", ZonedDateTime.now().format(DateTimeFormatter.ISO_INSTANT));
        
        return ResponseEntity.ok(response);
    }
}
