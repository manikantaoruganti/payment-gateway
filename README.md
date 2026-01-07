# Payment Gateway with Multi-Method Processing

A production-grade payment gateway system built with Spring Boot, React, and PostgreSQL. Supports UPI and Card payments with hosted checkout, merchant authentication, and comprehensive payment validation.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Or: Java 17+, Node.js 16+, PostgreSQL 15

### Run with Docker

```bash
cd payment-gateway
docker-compose up -d
```

Services will be available at:
- API: http://localhost:8000
- Dashboard: http://localhost:3000
- Checkout: http://localhost:3001

### Run Locally (Without Docker)

1. **Database Setup**
```bash
psql -U postgres -c "CREATE DATABASE payment_gateway;"
psql -U postgres -d payment_gateway -f backend/src/main/resources/schema.sql
```

2. **Backend**
```bash
cd backend
mvn spring-boot:run
```

3. **Frontend**
```bash
cd frontend
npm install && npm start
```

4. **Checkout Page**
```bash
cd checkout-page
npm install && npm start
```

## API Endpoints

### Health Check
`GET /health` - No authentication required

### Orders
- `POST /api/v1/orders` - Create payment order
- `GET /api/v1/orders/{order_id}` - Get order details

### Payments
- `POST /api/v1/payments` - Process payment
- `GET /api/v1/payments/{payment_id}` - Get payment status

### Test Endpoints
- `GET /api/v1/test/merchant` - Get test merchant details

## Authentication

All endpoints (except `/health`) require API key and secret:

```
Headers:
  X-Api-Key: key_test_abc123
  X-Api-Secret: secret_test_xyz789
```

## Test Merchant Credentials

- Email: test@example.com
- API Key: key_test_abc123
- API Secret: secret_test_xyz789

## Project Structure

```
payment-gateway/
├── backend/          # Spring Boot API
├── frontend/         # React Dashboard
├── checkout-page/    # React Checkout
├── docker-compose.yml
├── README.md
└── .env.example
```

## Features

- Merchant onboarding with API key authentication
- UPI payment processing with VPA validation
- Card payment processing with Luhn algorithm validation
- Card network detection (Visa, Mastercard, Amex, RuPay)
- Hosted checkout page for customers
- Transaction status tracking
- PostgreSQL for data persistence
- Docker containerization

## Environment Variables

See `.env.example` for all configuration options.

## Database Schema

### Merchants Table
- id (UUID, primary key)
- name, email, api_key, api_secret
- webhook_url, is_active
- created_at, updated_at

### Orders Table
- id (String, primary key: order_*)
- merchant_id (FK)
- amount, currency, receipt, notes
- status, created_at, updated_at

### Payments Table
- id (String, primary key: pay_*)
- order_id (FK), merchant_id (FK)
- amount, currency, method, status
- vpa, card_network, card_last4
- error_code, error_description
- created_at, updated_at
