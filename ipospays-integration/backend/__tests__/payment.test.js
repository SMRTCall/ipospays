const request = require('supertest');
const app = require('../index');
const Merchant = require('../models/Merchant');
const Transaction = require('../models/Transaction');
const axios = require('axios');

jest.mock('../models/Merchant');
jest.mock('../models/Transaction');
jest.mock('axios');
jest.mock('../utils/encryption');

describe('Payment API', () => {
  const rawAuthToken = 'token1234';
  const merchantData = {
    _id: 'merchant_id',
    merchantId: 'test1234',
    tpn: 'tpn1234',
    authToken: 'encrypted-token',
    getAuthToken: () => rawAuthToken,
  };

  const transactionData = {
    _id: 'transaction_id',
    merchant: 'merchant_id',
    transactionReferenceId: 'tx_12345',
    amount: 100,
    status: 'success',
    rrn: 'rrn_12345',
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    Merchant.findOne.mockResolvedValue(merchantData);
    const mockQuery = {
      populate: jest.fn().mockResolvedValue({
        ...transactionData,
        merchant: merchantData,
      }),
    };
    Transaction.findById.mockReturnValue(mockQuery);
    Transaction.prototype.save = jest.fn().mockResolvedValue(true);
  });

  it('should initiate a payment', async () => {
    axios.post.mockResolvedValue({ data: { information: 'hpp_url' } });

    const res = await request(app)
      .post('/api/payments/initiate')
      .send({ amount: 100, merchantId: 'test1234' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.hppUrl).toEqual('hpp_url');
  });

  it('should refund a transaction', async () => {
    axios.post.mockResolvedValue({ data: { iposTransactResponse: { responseCode: '200' } } });
    require('../utils/encryption').decrypt.mockReturnValue(rawAuthToken);


    const res = await request(app)
      .post('/api/payments/refund/transaction_id')
      .set('x-merchant-id', 'test1234')
      .set('x-auth-token', rawAuthToken)
      .send({ amount: 50 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Refund successful');
  });

  it('should void a transaction', async () => {
    axios.post.mockResolvedValue({ data: { iposTransactResponse: { responseCode: '200' } } });
    require('../utils/encryption').decrypt.mockReturnValue(rawAuthToken);

    const res = await request(app)
      .post('/api/payments/void/transaction_id')
      .set('x-merchant-id', 'test1234')
      .set('x-auth-token', rawAuthToken);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Void successful');
  });

  it('should return 404 when trying to refund a non-existent transaction', async () => {
    const mockQuery = {
      populate: jest.fn().mockResolvedValue(null),
    };
    Transaction.findById.mockReturnValue(mockQuery);
    require('../utils/encryption').decrypt.mockReturnValue(rawAuthToken);

    const res = await request(app)
      .post('/api/payments/refund/non_existent_id')
      .set('x-merchant-id', 'test1234')
      .set('x-auth-token', rawAuthToken)
      .send({ amount: 50 });

    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toEqual('Transaction not found');
  });
});
