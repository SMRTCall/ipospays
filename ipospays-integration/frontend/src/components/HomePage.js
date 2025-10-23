import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>iPosPays Integration Layer</h1>
      <nav>
        <ul>
          <li>
            <Link to="/register">Register as a Merchant</Link>
          </li>
          <li>
            <Link to="/payment">Make a Payment</Link>
          </li>
          <li>
            <Link to="/history">View Transaction History</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
