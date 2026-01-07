# Payment Gateway

A production-grade payment gateway system built with Spring Boot backend, React frontend, and PostgreSQL database. Supports multi-method payment processing (UPI and Cards) with hosted checkout page.

## Features

- **Merchant Onboarding**: Manage merchant accounts with API credentials
- **Order Management**: Create and track payment orders
- **Multi-Method Payments**: Support for UPI and Card payments
- **Payment Validation**: Luhn algorithm for cards, VPA validation for UPI
- **Hosted Checkout**: Professional checkout page for customers
- **Real-time Status**: Payment status tracking and updates
- **Docker Support**: Full containerization with docker-compose

## Tech Stack

- **Backend**: Spring Boot 3.x, Java 17+
- **Database**: PostgreSQL 15
- **Frontend**: React 18+, Node.js
- **Deployment**: Docker, Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/manikantaoruganti/payment-gateway.git
cd payment-gateway
```

2. Start the application:
```bash
docker-compose up -d
```

3. Wait for services to be healthy (30-60 seconds)

4. Access the applications:
- API: http://localhost:8000
- Dashboard: http://localhost:3000
- Checkout: http://localhost:3001

## API Endpoints

### Health Check
- `GET /health` - System health status

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/{order_id}` - Get order details

### Payments
- `POST /api/v1/payments` - Process payment
- `GET /api/v1/payments/{payment_id}` - Get payment status

### Test Endpoints
- `GET /api/v1/test/merchant` - Get test merchant details

## Default Credentials

**Test Merchant**:
- Email: `test@example.com`
- API Key: `key_test_abc123`
- API Secret: `secret_test_xyz789`

## Environment Variables

See `.env.example` for all available configuration options.

## Development

### Local Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Local Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Local Checkout Setup

```bash
cd checkout-page
npm install
npm start
```

## Project Structure

```
payment-gateway/
├── backend/           # Spring Boot API
├── frontend/          # React Dashboard
├── checkout-page/     # React Checkout
├── docker-compose.yml # Docker orchestration
├── README.md          # This file
└── .env.example       # Configuration template
```

## API Authentication

All API endpoints (except `/health`) require authentication via headers:
```
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789
```

## Database Schema

### Merchants Table
- id (UUID, PK)
- name (string)
- email (string, unique)
- api_key (string, unique)
- api_secret (string)
- webhook_url (text, optional)
- is_active (boolean)
- created_at, updated_at (timestamps)

### Orders Table
- id (string, PK) - format: order_[16alphanumeric]
- merchant_id (UUID, FK to merchants)
- amount (integer, in paise)
- currency (string, default: INR)
- receipt (string, optional)
- notes (JSON, optional)
- status (string, default: created)
- created_at, updated_at (timestamps)

### Payments Table
- id (string, PK) - format: pay_[16alphanumeric]
- order_id (string, FK to orders)
- merchant_id (UUID, FK to merchants)
- amount (integer, in paise)
- currency (string, default: INR)
- method (string: upi or card)
- status (string: created -> processing -> success/failed)
- vpa (string, for UPI)
- card_network (string, for cards)
- card_last4 (string, for cards)
- error_code (string, optional)
- error_description (text, optional)
- created_at, updated_at (timestamps)

## Payment Processing

### UPI Payment Flow
1. User selects UPI at checkout
2. Enters VPA (e.g., user@paytm)
3. VPA is validated with regex: `^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$`
4. Payment is processed with 5-10 second delay
5. 90% success rate (configurable)

### Card Payment Flow
1. User enters card details
2. Card number validated with Luhn algorithm
3. Expiry date validated
4. Card network detected (Visa/Mastercard/Amex/RuPay)
5. Only last 4 digits stored (never full number or CVV)
6. Payment processed with 5-10 second delay
7. 95% success rate (configurable)

## Testing

### Test Card Numbers
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- Amex: 378282246310005
- RuPay: 6011111111111117

### Test UPI IDs
- user@paytm
- customer@okhdfcbank
- test123@phonepe

## Troubleshooting

### Services won't start
- Ensure Docker daemon is running
- Check port availability (3000, 3001, 5432, 8000)
- Review docker-compose logs: `docker-compose logs -f`

### Database connection errors
- Ensure postgres service is healthy: `docker-compose ps`
- Check DATABASE_URL in environment
- Verify postgres credentials in docker-compose.yml

### API returns 401
- Verify X-Api-Key and X-Api-Secret headers
- Use test credentials: `key_test_abc123` / `secret_test_xyz789`
- Check merchant exists: `GET /api/v1/test/merchant`

## Performance

- Payment processing: ~7.5 seconds average (5-10 second delay)
- API response time: <100ms (excluding processing delay)
- Database queries: Indexed for fast lookups

## Security

- API Key + Secret authentication
- Card numbers never stored in full
- CVV never persisted
- HTTPS ready (configure in production)
- SQL injection protection via parameterized queries
- CORS configured for frontend

## Deployment

### Docker Production
```bash
docker-compose -f docker-compose.yml up -d
```

### Manual Deployment
See individual service README files for manual setup instructions.

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please open a GitHub issue.
