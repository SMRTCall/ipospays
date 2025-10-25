const request = require('supertest');
const app = require('../index');
const Merchant = require('../models/Merchant');
const Transaction = require('../models/Transaction');
const axios = require('axios');

jest.mock('../models/Merchant');
jest.mock('../models/Transaction');
jest.mock('axios');

describe('Payment API', () => {
  const merchantData = {
    _id: 'merchant_id',
    merchantId: 'test1234',
    tpn: 'tpn1234',
    getAuthToken: () => 'token1234',
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

    const res = await request(app)
      .post('/api/payments/refund/transaction_id')
      .send({ amount: 50 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Refund successful');
  });

  it('should void a transaction', async () => {
    axios.post.mockResolvedValue({ data: { iposTransactResponse: { responseCode: '200' } } });

    const res = await request(app)
      .post('/api/payments/void/transaction_id');

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Void successful');
  });
});
