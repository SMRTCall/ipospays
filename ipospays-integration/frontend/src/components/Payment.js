import React, { useState } from 'react';
import axios from 'axios';

const Payment = () => {
  const [amount, setAmount] = useState('');
  const [merchantId, setMerchantId] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/payments/initiate', {
        amount: parseFloat(amount),
        merchantId,
      });
      if (res.data.hppUrl) {
        window.location.href = res.data.hppUrl;
      }
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div>
      <h2>Make a Payment</h2>
      <form onSubmit={onSubmit}>
        <div>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Merchant ID"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            required
          />
        </div>
        <input type="submit" value="Pay" />
      </form>
    </div>
  );
};

export default Payment;
