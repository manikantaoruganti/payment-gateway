package com.gateway.services;

import com.gateway.dto.CreatePaymentRequest;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.regex.Pattern;

@Service
public class ValidationService {

    private static final Pattern VPA_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$");

    /* ---------- UPI ---------- */

    public boolean validateVPA(String vpa) {
        if (vpa == null || vpa.trim().isEmpty()) return false;
        return VPA_PATTERN.matcher(vpa).matches();
    }

    // ✅ REQUIRED: used by PaymentController & PaymentService
    public boolean isValidVpa(String vpa) {
        return validateVPA(vpa);
    }

    /* ---------- CARD ---------- */

    public boolean isValidCard(CreatePaymentRequest.CardDetails card) {
        if (card == null) return false;
        return validateCardNumber(card.getNumber())
                && validateCardExpiry(
                        String.valueOf(card.getExpiryMonth()),
                        String.valueOf(card.getExpiryYear())
                );
    }

public boolean validateCardNumber(String cardNumber) {
    if (cardNumber == null) return false;

    cardNumber = cardNumber.replaceAll("\\s+", "");
    if (!cardNumber.matches("\\d{16}")) return false;

    int sum = 0;
    boolean alternate = false;

    for (int i = cardNumber.length() - 1; i >= 0; i--) {
        int n = cardNumber.charAt(i) - '0';
        if (alternate) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
        alternate = !alternate;
    }

    return sum % 10 == 0;
}


    public boolean validateCardExpiry(String month, String year) {
        try {
            int m = Integer.parseInt(month);
            int y = Integer.parseInt(year);

            YearMonth expiry = YearMonth.of(y, m);
            return !expiry.isBefore(YearMonth.now());
        } catch (Exception e) {
            return false;
        }
    }

    public String detectCardNetwork(String cardNumber) {
        if (cardNumber == null) return "unknown";
        String c = cardNumber.replaceAll("[\\s-]", "");

        if (c.startsWith("4")) return "visa";
        if (c.matches("^5[1-5].*")) return "mastercard";
        if (c.matches("^3[47].*")) return "amex";
        if (c.matches("^(60|65|8[1-9]).*")) return "rupay";

        return "unknown";
    }

    public String getCardLast4(String cardNumber) {
        if (cardNumber == null) return "0000";
        String c = cardNumber.replaceAll("[\\s-]", "");
        return c.length() >= 4 ? c.substring(c.length() - 4) : "0000";
    }

    /* ---------- LUHN ---------- */

    private boolean luhnCheck(String number) {
        int sum = 0;
        boolean alt = false;

        for (int i = number.length() - 1; i >= 0; i--) {
            int n = number.charAt(i) - '0';
            if (alt) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alt = !alt;
        }
        return sum % 10 == 0;
    }
}
