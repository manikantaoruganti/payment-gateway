#!/bin/bash

# Payment Gateway Test Script
echo "Testing Payment Gateway System"
echo "================================"
echo ""

API_URL="http://localhost:8000"
API_KEY="key_test_abc123"
API_SECRET="secret_test_xyz789"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "Test 1: Health Check"
response=$(curl -s "$API_URL/health")
if echo "$response" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "Response: $response"
fi
echo ""

# Test 2: Test Merchant Endpoint
echo "Test 2: Test Merchant Endpoint"
response=$(curl -s "$API_URL/api/v1/test/merchant")
if echo "$response" | grep -q "test@example.com"; then
    echo -e "${GREEN}✓ Test merchant found${NC}"
else
    echo -e "${RED}✗ Test merchant not found${NC}"
    echo "Response: $response"
fi
echo ""

# Test 3: Create Order
echo "Test 3: Create Order"
order_response=$(curl -s -X POST "$API_URL/api/v1/orders" \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Api-Secret: $API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "test_receipt_001",
    "notes": {
      "customer_name": "Test Customer"
    }
  }')

if echo "$order_response" | grep -q "order_"; then
    echo -e "${GREEN}✓ Order created successfully${NC}"
    order_id=$(echo "$order_response" | grep -o '"id":"order_[^"]*"' | cut -d'"' -f4)
    echo "Order ID: $order_id"
else
    echo -e "${RED}✗ Order creation failed${NC}"
    echo "Response: $order_response"
    exit 1
fi
echo ""

# Test 4: Get Order
echo "Test 4: Get Order"
get_order_response=$(curl -s "$API_URL/api/v1/orders/$order_id" \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Api-Secret: $API_SECRET")

if echo "$get_order_response" | grep -q "$order_id"; then
    echo -e "${GREEN}✓ Order retrieved successfully${NC}"
else
    echo -e "${RED}✗ Order retrieval failed${NC}"
    echo "Response: $get_order_response"
fi
echo ""

# Test 5: Create UPI Payment
echo "Test 5: Create UPI Payment"
echo "This will take 5-10 seconds to process..."
payment_response=$(curl -s -X POST "$API_URL/api/v1/payments" \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Api-Secret: $API_SECRET" \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"$order_id\",
    \"method\": \"upi\",
    \"vpa\": \"test@paytm\"
  }")

if echo "$payment_response" | grep -q "pay_"; then
    echo -e "${GREEN}✓ UPI payment created${NC}"
    payment_id=$(echo "$payment_response" | grep -o '"id":"pay_[^"]*"' | cut -d'"' -f4)
    echo "Payment ID: $payment_id"
    
    # Get payment status
    sleep 2
    payment_status=$(curl -s "$API_URL/api/v1/payments/$payment_id" \
      -H "X-Api-Key: $API_KEY" \
      -H "X-Api-Secret: $API_SECRET")
    
    if echo "$payment_status" | grep -q "success"; then
        echo -e "${GREEN}✓ Payment successful${NC}"
    elif echo "$payment_status" | grep -q "failed"; then
        echo -e "${GREEN}✓ Payment failed (as expected by random simulation)${NC}"
    else
        echo "Payment status: Processing"
    fi
else
    echo -e "${RED}✗ UPI payment creation failed${NC}"
    echo "Response: $payment_response"
fi
echo ""

# Test 6: Create Card Payment
echo "Test 6: Create Card Payment"
echo "Creating new order for card payment..."
order_response2=$(curl -s -X POST "$API_URL/api/v1/orders" \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Api-Secret: $API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "currency": "INR"
  }')

order_id2=$(echo "$order_response2" | grep -o '"id":"order_[^"]*"' | cut -d'"' -f4)
echo "Order ID: $order_id2"

echo "Processing card payment (this will take 5-10 seconds)..."
card_payment_response=$(curl -s -X POST "$API_URL/api/v1/payments" \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Api-Secret: $API_SECRET" \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"$order_id2\",
    \"method\": \"card\",
    \"card\": {
      \"number\": \"4111111111111111\",
      \"expiryMonth\": \"12\",
      \"expiryYear\": \"2025\",
      \"cvv\": \"123\",
      \"holderName\": \"Test User\"
    }
  }")

if echo "$card_payment_response" | grep -q "pay_"; then
    echo -e "${GREEN}✓ Card payment created${NC}"
    card_payment_id=$(echo "$card_payment_response" | grep -o '"id":"pay_[^"]*"' | cut -d'"' -f4)
    echo "Payment ID: $card_payment_id"
    
    # Get payment status
    sleep 2
    card_payment_status=$(curl -s "$API_URL/api/v1/payments/$card_payment_id" \
      -H "X-Api-Key: $API_KEY" \
      -H "X-Api-Secret: $API_SECRET")
    
    if echo "$card_payment_status" | grep -q "success"; then
        echo -e "${GREEN}✓ Payment successful${NC}"
    elif echo "$card_payment_status" | grep -q "failed"; then
        echo -e "${GREEN}✓ Payment failed (as expected by random simulation)${NC}"
    else
        echo "Payment status: Processing"
    fi
else
    echo -e "${RED}✗ Card payment creation failed${NC}"
    echo "Response: $card_payment_response"
fi
echo ""

echo "================================"
echo "Testing Complete!"
echo ""
echo "To test the checkout page:"
echo "1. Open http://localhost:3001/checkout?order_id=$order_id"
echo "2. Select UPI or Card payment method"
echo "3. Complete the payment flow"
echo ""
echo "To test the dashboard:"
echo "1. Open http://localhost:3000"
echo "2. Login with email: test@example.com (any password)"
echo "3. View API credentials and transactions"
