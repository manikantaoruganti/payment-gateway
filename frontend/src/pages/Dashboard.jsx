import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [merchantData, setMerchantData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [merchantRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/merchants/profile`, { headers }),
        axios.get(`${API_BASE_URL}/orders`, { headers })
      ]);

      setMerchantData(merchantRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleCreateOrder = () => {
    navigate('/checkout');
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {merchantData && (
        <div className="merchant-info">
          <h2>{merchantData.businessName}</h2>
          <p>Merchant ID: {merchantData.merchantId}</p>
          <p>Email: {merchantData.businessEmail}</p>
        </div>
      )}

      <button onClick={handleCreateOrder} className="create-order-btn">
        Create New Order
      </button>

      <section className="orders-section">
        <h2>Recent Orders</h2>
        <div className="orders-list">
          {orders.length === 0 ? (
            <p>No orders yet</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="order-item">
                <strong>{order.orderId}</strong>
                <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                <span className="amount">${order.amount}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
