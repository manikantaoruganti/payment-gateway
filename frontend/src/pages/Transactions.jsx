import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Transactions.css';

const Transactions = ({ onLogout }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };
      const params = filter !== 'all' ? { status: filter } : {};

      const response = await axios.get(`${API_BASE_URL}/payments`, { headers, params });
      setPayments(response.data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'success': return 'success';
      case 'failed': return 'failed';
      case 'pending': return 'pending';
      default: return 'default';
    }
  };

  if (loading) return <div className="loading">Loading transactions...</div>;

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <h1>Transaction History</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-controls">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Transactions</option>
          <option value="SUCCESS">Successful</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Order ID</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr><td colSpan="6">No transactions found</td></tr>
          ) : (
            payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.transactionId}</td>
                <td>{payment.order?.orderId || 'N/A'}</td>
                <td>${payment.amount}</td>
                <td>{payment.paymentMethod}</td>
                <td><span className={`status ${getStatusColor(payment.status)}`}>{payment.status}</span></td>
                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
