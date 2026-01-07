import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/Success.css';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p className="message">Your payment has been processed successfully</p>
        
        <div className="transaction-details">
          {transactionId && (
            <>
              <p><strong>Transaction ID:</strong></p>
              <p className="transaction-id">{transactionId}</p>
            </>
          )}
        </div>
        
        <p className="redirect-message">Redirecting to dashboard in 5 seconds...</p>
        <button onClick={() => navigate('/dashboard')} className="return-btn">Return to Dashboard</button>
      </div>
    </div>
  );
};

export default Success;
