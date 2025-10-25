const request = require('supertest');
const app = require('../index'); // Adjust this path if your app entry point is different
const Merchant = require('../models/Merchant');

jest.mock('../models/Merchant');

describe('Merchant API', () => {
  it('should create a new merchant', async () => {
    const merchantData = {
      name: 'Test Merchant',
      merchantId: 'test1234',
      tpn: 'tpn1234',
      authToken: 'token1234',
    };

    Merchant.prototype.save = jest.fn().mockResolvedValue(merchantData);

    const res = await request(app)
      .post('/api/merchants')
      .send(merchantData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('Merchant created successfully');
  });
});
