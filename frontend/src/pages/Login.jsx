import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [merchantId, setMerchantId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!merchantId.trim()) {
      setError('Merchant ID is required');
      setLoading(false);
      return;
    }

    if (!apiKey.trim()) {
      setError('API Key is required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/merchants/auth`, {
        merchantId,
        apiKey
      });

      if (response.data && response.data.token) {
        onLogin(response.data.token);
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Payment Gateway Dashboard</h1>
        <p className="subtitle">Merchant Login</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="merchantId">Merchant ID</label>
            <input
              type="text"
              id="merchantId"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="Enter your merchant ID"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="footer-text">
          <p>Secure authentication powered by Payment Gateway</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
