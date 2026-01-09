import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple email-based authentication
    // For this deliverable, any password works
    if (email === 'test@example.com') {
      localStorage.setItem('merchantEmail', email);
      navigate('/dashboard');
    } else {
      alert('Please use test@example.com as email');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Payment Gateway</h2>
        <form data-test-id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              data-test-id="email-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              data-test-id="password-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button data-test-id="login-button" type="submit" className="btn btn-primary" style={{width: '100%'}}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
