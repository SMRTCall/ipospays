import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [merchantId, setMerchantId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!merchantId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/payments/history/${merchantId}`);
      setTransactions(res.data);
    } catch (err) {
      console.error(err.response.data);
    }
    setLoading(false);
  };

  const handleRefund = async (transactionId) => {
    const amount = prompt('Enter refund amount:');
    if (!amount || isNaN(amount)) {
      alert('Please enter a valid amount.');
      return;
    }
    try {
      await axios.post(`/api/payments/refund/${transactionId}`, { amount });
      alert('Refund successful!');
      fetchTransactions();
    } catch (err) {
      alert('Refund failed.');
      console.error(err.response.data);
    }
  };

  const handleVoid = async (transactionId) => {
    if (window.confirm('Are you sure you want to void this transaction?')) {
      try {
        await axios.post(`/api/payments/void/${transactionId}`);
        alert('Void successful!');
        fetchTransactions();
      } catch (err) {
        alert('Void failed.');
        console.error(err.response.data);
      }
    }
  };

  return (
    <div>
      <h2>Transaction History</h2>
      <div>
        <input
          type="text"
          placeholder="Enter Merchant ID"
          value={merchantId}
          onChange={(e) => setMerchantId(e.target.value)}
        />
        <button onClick={fetchTransactions} disabled={loading}>
          {loading ? 'Loading...' : 'Get History'}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Transaction Reference ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Dejavoo Transaction ID</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.transactionReferenceId}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.status}</td>
              <td>{transaction.dejavooTransactionId}</td>
              <td>{new Date(transaction.createdAt).toLocaleString()}</td>
              <td>
                {transaction.status === 'success' && (
                  <>
                    <button onClick={() => handleRefund(transaction._id)}>Refund</button>
                    <button onClick={() => handleVoid(transaction._id)}>Void</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
