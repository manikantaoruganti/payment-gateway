# Payment Gateway

A complete payment gateway system similar to Razorpay/Stripe with merchant onboarding, order management, multi-method payment processing (UPI and Cards), and hosted checkout.

## Features

- **Merchant Authentication**: API key and secret-based authentication
- **Order Management**: Create and retrieve payment orders
- **Multi-Method Payments**: Support for UPI and Card payments
- **Payment Validation**: VPA validation for UPI, Luhn algorithm for cards
- **Card Network Detection**: Automatic detection of Visa, Mastercard, Amex, RuPay
- **Hosted Checkout**: Customer-facing payment page
- **Merchant Dashboard**: View API credentials, transactions, and statistics

## Tech Stack

- **Backend**: Java Spring Boot with PostgreSQL
- **Frontend**: React (Dashboard and Checkout)
- **Deployment**: Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Java 17+ (for local development)
- Node.js 18+ (for local development)

### Running with Docker

```bash
# Clone the repository
git clone https://github.com/manikantaoruganti/payment-gateway.git
cd payment-gateway

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api
```

### Services

- **API**: http://localhost:8000
- **Dashboard**: http://localhost:3000
- **Checkout**: http://localhost:3001
- **PostgreSQL**: localhost:5432

### Test Merchant Credentials

The system automatically seeds a test merchant on startup:

- **Email**: test@example.com
- **API Key**: key_test_abc123
- **API Secret**: secret_test_xyz789

## API Documentation

### Base URL

```
http://localhost:8000
```

### Endpoints

#### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Create Order

```bash
POST /api/v1/orders
Headers:
  X-Api-Key: key_test_abc123
  X-Api-Secret: secret_test_xyz789
  Content-Type: application/json

Body:
{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": {
    "customer_name": "John Doe"
  }
}
```

#### Create Payment

```bash
POST /api/v1/payments
Headers:
  X-Api-Key: key_test_abc123
  X-Api-Secret: secret_test_xyz789
  Content-Type: application/json

# UPI Payment
Body:
{
  "order_id": "order_NXhj67fGH2jk9mPq",
  "method": "upi",
  "vpa": "user@paytm"
}

# Card Payment
Body:
{
  "order_id": "order_NXhj67fGH2jk9mPq",
  "method": "card",
  "card": {
    "number": "4111111111111111",
    "expiry_month": "12",
    "expiry_year": "2025",
    "cvv": "123",
    "holder_name": "John Doe"
  }
}
```

## Testing

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Create order
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "currency": "INR"}'

# Create UPI payment
curl -X POST http://localhost:8000/api/v1/payments \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "order_xxx", "method": "upi", "vpa": "user@paytm"}'
```

### Using the Checkout Page

1. Create an order using the API
2. Copy the order_id from the response
3. Visit: http://localhost:3001/checkout?order_id=order_xxx
4. Complete the payment using UPI or Card

## Development

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend (Dashboard)

```bash
cd frontend
npm install
npm start
```

### Checkout Page

```bash
cd checkout-page
npm install
npm start
```

## Database Schema

### Merchants Table
- id (UUID, primary key)
- name (VARCHAR 255)
- email (VARCHAR 255, unique)
- api_key (VARCHAR 64, unique)
- api_secret (VARCHAR 64)
- webhook_url (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Orders Table
- id (VARCHAR 64, primary key, format: order_xxxxxxxxxxxxxxxx)
- merchant_id (UUID, foreign key)
- amount (INTEGER, minimum 100)
- currency (VARCHAR 3)
- receipt (VARCHAR 255)
- notes (JSONB)
- status (VARCHAR 20)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Payments Table
- id (VARCHAR 64, primary key, format: pay_xxxxxxxxxxxxxxxx)
- order_id (VARCHAR 64, foreign key)
- merchant_id (UUID, foreign key)
- amount (INTEGER)
- currency (VARCHAR 3)
- method (VARCHAR 20: upi/card)
- status (VARCHAR 20: processing/success/failed)
- vpa (VARCHAR 255, for UPI)
- card_network (VARCHAR 20)
- card_last4 (VARCHAR 4)
- error_code (VARCHAR 50)
- error_description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Payment Processing

### Success Rates
- UPI: 90% success rate
- Card: 95% success rate

### Processing Flow
1. Validate payment method and credentials
2. Create payment record with status "processing"
3. Simulate bank processing (5-10 seconds delay)
4. Update status to "success" or "failed" based on random outcome

### Validation

**UPI VPA Format**: ^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$

**Card Validation**:
- Luhn algorithm for card number validation
- Network detection (Visa, Mastercard, Amex, RuPay)
- Expiry date validation
- Only last 4 digits stored (never full number or CVV)

## Environment Variables

See `.env.example` for all configuration options.

## Deployment

The application is fully containerized and can be deployed using Docker Compose:

```bash
docker-compose up -d
```

## Security Notes

- Never store full card numbers or CVV
- API authentication required for all protected endpoints
- Use environment variables for sensitive configuration
- Implement proper error handling without exposing sensitive details

## Build Verification

Before submission, verify the complete system:

### Step 1: Start all services

```bash
docker-compose up -d --build
```

### Step 2: Check service health

```bash
# Check all containers are running
docker-compose ps

# Check API health
curl http://localhost:8000/health

# Check test merchant seeding
curl http://localhost:8000/api/v1/test/merchant
```

### Step 3: Run API tests

```bash
chmod +x test-api.sh
./test-api.sh
```

### Step 4: Test frontend applications

**Dashboard (Port 3000):**
1. Open http://localhost:3000
2. Login with: test@example.com (any password)
3. Verify API credentials are displayed
4. Check transactions page

**Checkout Page (Port 3001):**
1. Create an order using the API (see test-api.sh)
2. Open http://localhost:3001/checkout?order_id=<your_order_id>
3. Test UPI payment with VPA: test@paytm
4. Test Card payment with: 4111111111111111, 12/25, 123
5. Verify payment processing and status updates

### Common Issues

**Containers not starting:**
- Check Docker daemon is running
- Ensure ports 3000, 3001, 5432, 8000 are not in use
- Check logs: `docker-compose logs`

**Database connection errors:**
- Wait for PostgreSQL health check to pass
- Check DATABASE_URL in docker-compose.yml

**API returning 500 errors:**
- Check backend logs: `docker-compose logs api`
- Verify test merchant was seeded

**Frontend not loading:**
- Clear browser cache
- Check frontend logs: `docker-compose logs dashboard` or `docker-compose logs checkout`

## Automated Testing

The system includes all required data-test-id attributes for automated evaluation:

**Dashboard:**
- `login-form`, `email-input`, `password-input`, `login-button`
- `dashboard`, `api-credentials`, `api-key`, `api-secret`
- `stats-container`, `total-transactions`, `total-amount`, `success-rate`
- `transactions-table`, `transaction-row`, `payment-id`, `order-id`, etc.

**Checkout:**
- `checkout-container`, `order-summary`, `order-amount`, `order-id`
- `payment-methods`, `method-upi`, `method-card`
- `upi-form`, `vpa-input`, `card-form`, `card-number-input`, etc.
- `processing-state`, `processing-message`
- `success-state`, `payment-id`, `success-message`
- `error-state`, `error-message`, `retry-button`

## API Contract Summary

All endpoints return JSON responses with proper HTTP status codes:
- 200: Successful GET
- 201: Successful resource creation
- 400: Bad request / validation error
- 401: Authentication error
- 404: Resource not found

Error responses follow the format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "description": "Human readable description"
  }
}
```

## License

MIT
