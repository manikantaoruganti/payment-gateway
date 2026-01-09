import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    successRate: 0
  });
  const [credentials, setCredentials] = useState({
    apiKey: 'key_test_abc123',
    apiSecret: 'secret_test_xyz789'
  });

  useEffect(() => {
    const merchantEmail = localStorage.getItem('merchantEmail');
    if (!merchantEmail) {
      navigate('/login');
      return;
    }

    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/test/merchant`);
      if (response.ok) {
        // Fetch all payments for the test merchant
        // Note: In a real app, we'd have an endpoint for this
        // For now, we'll use placeholder data or calculate from available data
        
        // Simulate stats calculation
        setStats({
          totalTransactions: 0,
          totalAmount: 0,
          successRate: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('merchantEmail');
    navigate('/login');
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-content">
          <h1>Payment Gateway Dashboard</h1>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/dashboard/transactions">Transactions</Link>
            <button onClick={handleLogout} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}>Logout</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div data-test-id="dashboard">
          <div className="card">
            <h2>API Credentials</h2>
            <div data-test-id="api-credentials" className="credentials">
              <div>
                <label>API Key</label>
                <span data-test-id="api-key">{credentials.apiKey}</span>
              </div>
              <div>
                <label>API Secret</label>
                <span data-test-id="api-secret">{credentials.apiSecret}</span>
              </div>
            </div>
          </div>

          <div data-test-id="stats-container" className="stats-grid">
            <div className="stat-card">
              <h3>Total Transactions</h3>
              <div className="value" data-test-id="total-transactions">{stats.totalTransactions}</div>
            </div>
            <div className="stat-card">
              <h3>Total Amount</h3>
              <div className="value" data-test-id="total-amount">₹{(stats.totalAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="stat-card">
              <h3>Success Rate</h3>
              <div className="value" data-test-id="success-rate">{stats.successRate}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
