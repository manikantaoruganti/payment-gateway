import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const orderId = searchParams.get('orderId');
  const merchantId = searchParams.get('merchantId');

  useEffect(() => {
    if (orderId && merchantId) {
      fetchOrderData();
    }
  }, [orderId, merchantId]);

  const fetchOrderData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: { 'X-Merchant-ID': merchantId }
      });
      setOrderData(response.data);
    } catch (err) {
      setError('Failed to load order details');
    }
  };

  const validateCardData = () => {
    if (!cardData.number || cardData.number.length < 13) {
      setError('Invalid card number');
      return false;
    }
    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      setError('Invalid expiry date (MM/YY)');
      return false;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      setError('Invalid CVV');
      return false;
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateCardData()) return;

    setLoading(true);
    try {
      const paymentPayload = {
        orderId: orderData.id,
        amount: orderData.amount,
        paymentMethod,
        cardToken: 'encrypted_token_here', // In production, use Stripe/Razorpay tokens
        merchantId
      };

      const response = await axios.post(`${API_BASE_URL}/payments/process`, paymentPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Merchant-ID': merchantId
        }
      });

      if (response.data.status === 'SUCCESS') {
        navigate(`/success?transactionId=${response.data.transactionId}`);
      } else {
        navigate(`/failure?reason=${response.data.reason}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return <div className="checkout-loading">Loading order details...</div>;
  }

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h1>Secure Checkout</h1>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          <p><strong>Order ID:</strong> {orderData.orderId}</p>
          <p><strong>Amount:</strong> <span className="amount">${orderData.amount}</span></p>
          <p><strong>Customer:</strong> {orderData.customerName}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handlePayment}>
          <div className="payment-method">
            <label>
              <input type="radio" value="CARD" checked={paymentMethod === 'CARD'} onChange={(e) => setPaymentMethod(e.target.value)} />
              Credit/Debit Card
            </label>
          </div>

          {paymentMethod === 'CARD' && (
            <div className="card-form">
              <input type="text" placeholder="Card Number" value={cardData.number} onChange={(e) => setCardData({...cardData, number: e.target.value})} disabled={loading} required />
              <input type="text" placeholder="MM/YY" value={cardData.expiry} onChange={(e) => setCardData({...cardData, expiry: e.target.value})} disabled={loading} required />
              <input type="text" placeholder="CVV" value={cardData.cvv} onChange={(e) => setCardData({...cardData, cvv: e.target.value})} disabled={loading} required />
            </div>
          )}

          <button type="submit" className="pay-btn" disabled={loading}>
            {loading ? `Processing $${orderData.amount}...` : `Pay $${orderData.amount}`}
          </button>
        </form>

        <p className="security-notice">🔒 Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
};

export default Checkout;
