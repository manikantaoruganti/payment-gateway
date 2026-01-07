# Checkout Page Dockerfile - Secure Payment Checkout Form
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY public ./public

# Build the application
RUN npm run build

# Production stage with security headers
FROM node:18-alpine

WORKDIR /app

# Install serve for static file serving with security headers
RUN npm install -g serve

# Copy built application from build stage
COPY --from=build /app/build ./build

# Create .serverc for security headers
RUN echo '{
  "headers": [
    {
      "source":"/",
      "headers": [
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "X-XSS-Protection", "value": "1; mode=block"},
        {"key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains"}
      ]
    }
  ]
}' > .serverc.json

# Expose port for checkout page
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["serve", "-s", "build", "-l", "3001"]
