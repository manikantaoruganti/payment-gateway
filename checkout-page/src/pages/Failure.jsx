import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Failure.css';

const Failure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Unknown error';

  return (
    <div className="failure-container">
      <div className="failure-card">
        <div className="failure-icon">✕</div>
        <h1>Payment Failed</h1>
        <p className="message">Unfortunately, your payment could not be processed.</p>
        <div className="error-details">
          <h3>Error Details</h3>
          <p className="error-reason">{reason}</p>
        </div>
        <button onClick={() => navigate('/checkout')} className="retry-btn">
          Try Again
        </button>
        <button onClick={() => navigate('/')} className="home-btn">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Failure;
