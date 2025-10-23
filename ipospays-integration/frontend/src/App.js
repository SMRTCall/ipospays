import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import MerchantRegistration from './components/MerchantRegistration';
import Payment from './components/Payment';
import TransactionHistory from './components/TransactionHistory';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import PaymentCancel from './components/PaymentCancel';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<MerchantRegistration />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/history" element={<TransactionHistory />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
