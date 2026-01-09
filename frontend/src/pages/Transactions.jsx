import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const merchantEmail = localStorage.getItem('merchantEmail');
    if (!merchantEmail) {
      navigate('/login');
      return;
    }

    fetchTransactions();
  }, [navigate]);

  const fetchTransactions = async () => {
    try {
      // Note: In a real app, we'd have an endpoint to fetch all payments for a merchant
      // For now, we'll show empty or placeholder data
      setTransactions([]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('merchantEmail');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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
        <div className="card">
          <h2>Transactions</h2>
          <table data-test-id="transactions-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} data-test-id="transaction-row" data-payment-id={transaction.id}>
                    <td data-test-id="payment-id">{transaction.id}</td>
                    <td data-test-id="order-id">{transaction.orderId}</td>
                    <td data-test-id="amount">{transaction.amount}</td>
                    <td data-test-id="method">{transaction.method}</td>
                    <td>
                      <span className={`status ${transaction.status}`} data-test-id="status">
                        {transaction.status}
                      </span>
                    </td>
                    <td data-test-id="created-at">{formatDate(transaction.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
