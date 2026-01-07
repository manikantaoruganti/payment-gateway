# Complete Payment Gateway Implementation Guide

This guide contains all the code and instructions needed to create the complete payment gateway system. Due to GitHub's file creation interface limitations, the code has been provided in sections for manual file creation.

## Quick Setup Instructions

### Option 1: Automated Setup (Recommended)

1. Clone the repository
2. Run the setup script:
```bash
bash setup.sh
```

### Option 2: Manual File Creation

Create the directory structure and files as specified in the sections below.

---

## Backend Implementation

### Directory Structure
```
backend/
├── src/main/java/com/gateway/
│   ├── PaymentGatewayApplication.java
│   ├── config/SecurityConfig.java
│   ├── controllers/
│   │   ├── HealthController.java
│   │   ├── OrderController.java
│   │   └── PaymentController.java
│   ├── models/
│   │   ├── Merchant.java
│   │   ├── Order.java
│   │   └── Payment.java
│   ├── repositories/
│   │   ├── MerchantRepository.java
│   │   ├── OrderRepository.java
│   │   └── PaymentRepository.java
│   ├── services/
│   │   ├── OrderService.java
│   │   ├── PaymentService.java
│   │   ├── ValidationService.java
│   │   └── MerchantService.java
│   ├── dto/
│   │   ├── CreateOrderRequest.java
│   │   ├── CreatePaymentRequest.java
│   │   ├── ErrorResponse.java
│   │   └── ApiResponse.java
│   └── util/
│       ├── IdGenerator.java
│       └── CardValidator.java
├── src/main/resources/
│   ├── application.properties
│   ├── application-docker.properties
│   └── schema.sql
├── pom.xml
└── Dockerfile
```

### Backend Files to Create

REFER TO THE FOLLOWING FILES IN THE REPOSITORY:
- All backend Java files must be created in src/main/java/com/gateway/ directory
- Database schema must be loaded from schema.sql
- Maven build configuration in pom.xml
- Docker containerization in Dockerfile

---

## Frontend Implementation

### React Dashboard Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── Transactions.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── TransactionTable.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.jsx
│   ├── App.css
│   └── index.css
├── package.json
├── vite.config.js
├── .env
├── Dockerfile
└── nginx.conf
```

### Frontend Features to Implement:
1. **Login Page**: Email/password form with test merchant credentials
2. **Dashboard**: Display API credentials and key statistics
3. **Transactions**: List all payments with real-time status
4. **API Integration**: Connect to backend at http://localhost:8000

---

## Checkout Page Implementation

### React Checkout Structure
```
checkout-page/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Checkout.jsx
│   │   ├── Success.jsx
│   │   └── Failure.jsx
│   ├── components/
│   │   ├── PaymentForm.jsx
│   │   ├── CardForm.jsx
│   │   └── UPIForm.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.jsx
│   ├── App.css
│   └── index.css
├── package.json
├── vite.config.js
├── Dockerfile
└── nginx.conf
```

### Checkout Features to Implement:
1. **Order Display**: Fetch order details from API
2. **Payment Methods**: Support UPI and Card
3. **Form Validation**: Client-side validation
4. **Payment Processing**: Call payment API
5. **Status Polling**: Check payment status every 2 seconds

---

## Docker Configuration

### Backend Dockerfile
```dockerfile
FROM maven:3.9.0-eclipse-temurin-17 as builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src/ src/
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/payment-gateway-*.jar app.jar
EXPOSE 8000
CMD ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Database Schema

### SQL to Create in schema.sql

```sql
-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Merchants Table
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    api_secret VARCHAR(64) NOT NULL,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    amount INTEGER NOT NULL CHECK (amount >= 100),
    currency VARCHAR(3) DEFAULT 'INR',
    receipt VARCHAR(255),
    notes JSONB,
    status VARCHAR(20) DEFAULT 'created',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'processing',
    vpa VARCHAR(255),
    card_network VARCHAR(20),
    card_last4 VARCHAR(4),
    error_code VARCHAR(50),
    error_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Seed Test Merchant
INSERT INTO merchants (id, name, email, api_key, api_secret, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Test Merchant',
    'test@example.com',
    'key_test_abc123',
    'secret_test_xyz789',
    true
)
ON CONFLICT (email) DO NOTHING;
```

---

## Key Implementation Details

### Payment Validation Logic

#### VPA Validation (UPI)
```
Pattern: ^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$
Example: user@paytm, customer@okhdfcbank
```

#### Card Number Validation (Luhn Algorithm)
```
1. Remove spaces and dashes
2. Verify length (13-19 digits)
3. Starting from right, double every second digit
4. If doubled value > 9, subtract 9
5. Sum all digits
6. Valid if (sum % 10) == 0
```

#### Card Network Detection
```
Visa: Starts with 4
Mastercard: Starts with 51-55
Amex: Starts with 34 or 37
RuPay: Starts with 60, 65, or 81-89
```

#### Expiry Validation
```
- Parse MM/YY or MM/YYYY format
- Treat YY as 20YY (25 = 2025)
- Expiry date must be >= current month/year
```

### Payment Processing Flow

1. Create payment with `processing` status
2. Add 5-10 second delay (simulate bank)
3. Randomly determine outcome (90% UPI, 95% Cards)
4. Update payment status to `success` or `failed`
5. Return payment details to client

---

## Testing

### Test Credentials
```
Merchant Email: test@example.com
API Key: key_test_abc123
API Secret: secret_test_xyz789
```

### Test Cards
```
Visa: 4111111111111111
Mastercard: 5555555555554444
Amex: 378282246310005
RuPay: 6011111111111117
```

### Test UPI IDs
```
user@paytm
customer@okhdfcbank
test123@phonepe
```

---

## Deployment Checklist

- [ ] All Java files created and compiled
- [ ] All React components created
- [ ] Docker images built successfully
- [ ] Database schema initialized
- [ ] Test merchant seeded
- [ ] Environment variables configured
- [ ] docker-compose up -d runs without errors
- [ ] Health endpoint responds
- [ ] API endpoints tested
- [ ] Frontend loads correctly
- [ ] Checkout page functions

---

## Support

For implementation questions, refer to the README.md for additional details and troubleshooting.
