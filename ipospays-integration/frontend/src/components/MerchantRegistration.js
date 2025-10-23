import React, { useState } from 'react';
import axios from 'axios';

const MerchantRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    merchantId: '',
    tpn: '',
    authToken: '',
  });

  const { name, merchantId, tpn, authToken } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/merchants', formData);
      console.log(res.data);
      // Handle success (e.g., show a success message, redirect)
    } catch (err) {
      console.error(err.response.data);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <div>
      <h2>Register as a Merchant</h2>
      <form onSubmit={onSubmit}>
        <div>
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Merchant ID"
            name="merchantId"
            value={merchantId}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="TPN"
            name="tpn"
            value={tpn}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Auth Token"
            name="authToken"
            value={authToken}
            onChange={onChange}
            required
          />
        </div>
        <input type="submit" value="Register" />
      </form>
    </div>
  );
};

export default MerchantRegistration;
