const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const Merchant = require('../models/Merchant');
const { encrypt } = require('../utils/encryption');

const app = express();
app.get('/test', protect, (req, res) => res.status(200).send('OK'));

jest.mock('../models/Merchant');
jest.mock('../utils/encryption');

describe('Auth Middleware', () => {
  let testMerchant;
  const rawAuthToken = 'test-auth-token';

  beforeEach(() => {
    testMerchant = {
      _id: new mongoose.Types.ObjectId(),
      merchantId: 'test-merchant',
      authToken: 'encrypted-token',
    };
    Merchant.findOne.mockResolvedValue(testMerchant);
    require('../utils/encryption').decrypt.mockReturnValue(rawAuthToken);
  });

  it('should allow access with valid credentials', async () => {
    const res = await request(app)
      .get('/test')
      .set('x-merchant-id', 'test-merchant')
      .set('x-auth-token', rawAuthToken);
    expect(res.statusCode).toEqual(200);
  });

  it('should deny access without credentials', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toEqual(401);
  });

  it('should deny access with invalid merchant ID', async () => {
    Merchant.findOne.mockResolvedValue(null);
    const res = await request(app)
      .get('/test')
      .set('x-merchant-id', 'invalid-merchant')
      .set('x-auth-token', rawAuthToken);
    expect(res.statusCode).toEqual(401);
  });

  it('should deny access with invalid auth token', async () => {
    const res = await request(app)
      .get('/test')
      .set('x-merchant-id', 'test-merchant')
      .set('x-auth-token', 'invalid-token');
    expect(res.statusCode).toEqual(401);
  });
});
