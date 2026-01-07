# Payment Gateway

A complete, production-ready mini payment gateway built with Spring Boot, React, and Docker. Supports UPI and card payments with full validation, test mode, and hosted checkout.

## Features

✅ **Merchant API** - RESTful API with API Key + API Secret authentication  
✅ **Order Management** - Create and retrieve orders  
✅ **Payment Processing** - UPI and card payment support  
✅ **Validation** - Luhn algorithm, VPA regex, card expiry, network detection  
✅ **Test Mode** - Deterministic payment outcomes for testing  
✅ **Dashboard** - Merchant dashboard showing stats and transactions  
✅ **Hosted Checkout** - Embed-friendly payment page  
✅ **Docker Compose** - Complete stack with PostgreSQL  

## Quick Start

### Prerequisites
- Docker and Docker Compose
- (Optional) Java 17+, Node.js 18+, PostgreSQL 15

### Run with Docker

```bash
git clone https://github.com/manikantaoruganti/payment-gateway.git
cd payment-gateway
docker-compose up -d --build
```

### Services

| Service | URL | Port |
|---------|-----|------|
| API | http://localhost:8000 | 8000 |
| Dashboard | http://localhost:3000 | 3000 |
| Checkout | http://localhost:3001 | 3001 |
| Database | localhost | 5432 |

## Test Credentials

```
Email: test@example.com
API Key: key_test_abc123
API Secret: secret_test_xyz789
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Create Order
```bash
POST /api/v1/orders
Header: X-Api-Key, X-Api-Secret
Body: { "amount": 50000, "currency": "INR" }
```

### Create Payment
```bash
POST /api/v1/payments
Header: X-Api-Key, X-Api-Secret
Body (UPI): { "order_id": "...", "method": "upi", "vpa": "user@upi" }
Body (Card): { "order_id": "...", "method": "card", "card_number": "...", "expiry": "12/25", "cvv": "123" }
```

### Get Payment Status
```bash
GET /api/v1/payments/{payment_id}
Header: X-Api-Key, X-Api-Secret
```

## Project Structure

```
payment-gateway/
├── docker-compose.yml
├── README.md
├── .env.example
├── backend/                      # Spring Boot API
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/gateway/
│       ├── PaymentGatewayApplication.java
│       ├── config/SecurityConfig.java
│       ├── controllers/
│       ├── models/
│       ├── repositories/
│       ├── services/
│       └── dto/
├── frontend/                     # Merchant Dashboard (React)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── pages/ (Login, Dashboard, Transactions)
│       └── components/
└── checkout-page/                # Hosted Checkout (React)
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── pages/ (Checkout, Success, Failure)
        └── components/
```

## Configuration

See `.env.example` for all configuration options:

```ini
DATABASE_URL=postgresql://gateway_user:gateway_pass@postgres:5432/payment_gateway
PORT=8000
TEST_MERCHANT_EMAIL=test@example.com
TEST_API_KEY=key_test_abc123
TEST_API_SECRET=secret_test_xyz789
UPI_SUCCESS_RATE=0.90
CARD_SUCCESS_RATE=0.95
TEST_MODE=false
TEST_PAYMENT_SUCCESS=true
TEST_PROCESSING_DELAY=1000
```

## Testing

### Test Merchant
```bash
curl http://localhost:8000/api/v1/test/merchant
```

### Create Test Order
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -d '{"amount":50000,"currency":"INR"}'
```

### Test UPI Payment
```bash
curl -X POST http://localhost:8000/api/v1/payments \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -d '{
    "order_id": "order_abc123xyz789...",
    "method": "upi",
    "vpa": "user@okhdfcbank"
  }'
```

## Technology Stack

**Backend**
- Spring Boot 3.2.5
- Spring Data JPA
- Spring Security
- PostgreSQL 15
- Maven 3.9.6

**Frontend**
- React 18
- React Router 6
- Vite
- Node.js 20

**DevOps**
- Docker & Docker Compose
- PostgreSQL with health checks

## Validation Rules

### UPI (VPA)
- Pattern: `^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$`
- Example: `user@okhdfcbank`

### Card
- **Luhn Check**: Full Luhn algorithm validation
- **Length**: 13-19 digits
- **Expiry**: MM/YY or MM/YYYY format, must not be expired
- **Networks**: Visa, Mastercard, Amex, RuPay, Unknown
- **Last 4 Digits**: Stored, full number never persisted

## Payment Flow

1. **Create Order** → Returns `order_id` with amount
2. **Create Payment** → Validates order, method, and payment details
3. **Processing** → Status = `processing` (5-10s delay simulated)
4. **Outcome** → Status = `success` or `failed` based on success rates
5. **Retrieve Payment** → Get full payment details and status

## Test Mode

When `TEST_MODE=true`, payments use:
- `TEST_PAYMENT_SUCCESS`: Always success or always fail
- `TEST_PROCESSING_DELAY`: Fixed delay (default 1000ms)

When `TEST_MODE=false` (production), payments use:
- Random outcomes based on `UPI_SUCCESS_RATE` and `CARD_SUCCESS_RATE`
- Random delay between `PROCESSING_DELAY_MIN` and `PROCESSING_DELAY_MAX`

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, create a GitHub issue in this repository.
