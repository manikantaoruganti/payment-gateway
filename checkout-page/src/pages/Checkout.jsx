import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

function Checkout() {
  const [state, setState] = useState('loading'); // loading, form, processing, success, error
  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // UPI form
  const [vpa, setVpa] = useState('');
  
  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    
    if (!orderId) {
      setState('error');
      setErrorMessage('Order ID is required');
      return;
    }
    
    fetchOrder(orderId);
  }, []);

  const fetchOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/public`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      const data = await response.json();
      setOrder(data);
      setState('form');
    } catch (error) {
      setState('error');
      setErrorMessage('Failed to load order details');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setState('processing');
    
    let paymentData = {
      orderId: order.id,
      method: selectedMethod
    };
    
    if (selectedMethod === 'upi') {
      paymentData.vpa = vpa;
    } else if (selectedMethod === 'card') {
      // Parse expiry (MM/YY format)
      const [month, year] = expiry.split('/');
      
      paymentData.card = {
        number: cardNumber,
        expiryMonth: month,
        expiryYear: year,
        cvv: cvv,
        holderName: holderName
      };
    }
    
    try {
      const response = await fetch(`${API_URL}/api/v1/payments/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.description || 'Payment failed');
      }
      
      const payment = await response.json();
      setPaymentId(payment.id);
      
      // Poll for payment status
      pollPaymentStatus(payment.id);
      
    } catch (error) {
      setState('error');
      setErrorMessage(error.message);
    }
  };

  const pollPaymentStatus = async (paymentId) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    const poll = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/payments/${paymentId}/public`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment status');
        }
        
        const payment = await response.json();
        
        if (payment.status === 'success') {
          setState('success');
          return;
        } else if (payment.status === 'failed') {
          setState('error');
          setErrorMessage(payment.errorDescription || 'Payment failed');
          return;
        }
        
        // Continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setState('error');
          setErrorMessage('Payment processing timeout');
        }
      } catch (error) {
        setState('error');
        setErrorMessage('Failed to check payment status');
      }
    };
    
    poll();
  };

  const handleRetry = () => {
    setState('form');
    setSelectedMethod(null);
    setVpa('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setHolderName('');
    setErrorMessage('');
  };

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  if (state === 'loading') {
    return (
      <div className="checkout-container">
        <div className="card">
          <div className="processing-state">
            <div className="spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="card">
        {state === 'form' && (
          <div data-test-id="checkout-container">
            <div className="header">
              <h2>Complete Payment</h2>
            </div>
            
            <div data-test-id="order-summary" className="order-summary">
              <div>
                <span>Order ID:</span>
                <span data-test-id="order-id">{order.id}</span>
              </div>
              <div>
                <span>Amount:</span>
                <span data-test-id="order-amount">{formatAmount(order.amount)}</span>
              </div>
            </div>

            <div data-test-id="payment-methods" className="payment-methods">
              <button
                data-test-id="method-upi"
                data-method="upi"
                className={`method-button ${selectedMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('upi')}
              >
                UPI
              </button>
              <button
                data-test-id="method-card"
                data-method="card"
                className={`method-button ${selectedMethod === 'card' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('card')}
              >
                Card
              </button>
            </div>

            {selectedMethod === 'upi' && (
              <form data-test-id="upi-form" className="payment-form" onSubmit={handlePayment}>
                <div className="form-group">
                  <label>UPI ID</label>
                  <input
                    data-test-id="vpa-input"
                    type="text"
                    placeholder="username@bank"
                    value={vpa}
                    onChange={(e) => setVpa(e.target.value)}
                    required
                  />
                </div>
                <button data-test-id="pay-button" type="submit" className="btn btn-primary">
                  Pay {formatAmount(order.amount)}
                </button>
              </form>
            )}

            {selectedMethod === 'card' && (
              <form data-test-id="card-form" className="payment-form" onSubmit={handlePayment}>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    data-test-id="card-number-input"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      data-test-id="expiry-input"
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      data-test-id="cvv-input"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    data-test-id="cardholder-name-input"
                    type="text"
                    placeholder="Name on Card"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    required
                  />
                </div>
                <button data-test-id="pay-button" type="submit" className="btn btn-primary">
                  Pay {formatAmount(order.amount)}
                </button>
              </form>
            )}
          </div>
        )}

        {state === 'processing' && (
          <div data-test-id="processing-state" className="processing-state">
            <div className="spinner"></div>
            <p data-test-id="processing-message">Processing payment...</p>
          </div>
        )}

        {state === 'success' && (
          <div data-test-id="success-state" className="success-state">
            <div className="icon">✓</div>
            <h2>Payment Successful!</h2>
            <div className="info">
              <div>
                <span>Payment ID:</span>
                <span data-test-id="payment-id">{paymentId}</span>
              </div>
              {order && (
                <div>
                  <span>Amount:</span>
                  <span>{formatAmount(order.amount)}</span>
                </div>
              )}
            </div>
            <p data-test-id="success-message">Your payment has been processed successfully</p>
          </div>
        )}

        {state === 'error' && (
          <div data-test-id="error-state" className="error-state">
            <div className="icon">✕</div>
            <h2>Payment Failed</h2>
            <p data-test-id="error-message">{errorMessage || 'Payment could not be processed'}</p>
            {order && (
              <button data-test-id="retry-button" onClick={handleRetry} className="btn btn-secondary">
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
