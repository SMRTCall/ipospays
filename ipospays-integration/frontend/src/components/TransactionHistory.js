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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
