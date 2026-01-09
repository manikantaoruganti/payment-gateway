-- Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    api_secret VARCHAR(64) NOT NULL,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id UUID NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 100),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    receipt VARCHAR(255),
    notes JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'created',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    merchant_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'processing',
    vpa VARCHAR(255),
    card_network VARCHAR(20),
    card_last4 VARCHAR(4),
    error_code VARCHAR(50),
    error_description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
