const axios = require('axios');
const dotenv = require('dotenv');
const Merchant = require('../models/Merchant');
const Transaction = require('../models/Transaction');

dotenv.config();

const initiatePayment = async (req, res) => {
  try {
    const { amount, merchantId } = req.body;

    const merchant = await Merchant.findOne({ merchantId });
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    const authToken = merchant.getAuthToken();
    const transactionReferenceId = `tx_${Date.now()}`;

    const newTransaction = new Transaction({
      merchant: merchant._id,
      transactionReferenceId,
      amount,
    });
    await newTransaction.save();

    const dejavooApiUrl = 'https://payment.ipospays.tech/api/v1/external-payment-transaction';

    const payload = {
      merchantAuthentication: {
        merchantId: merchant.tpn,
        transactionReferenceId,
      },
      transactionRequest: {
        transactionType: 1, // 1 for SALE
        amount: Math.round(amount * 100), // Amount in cents
      },
      notificationOption: {
        notifyByRedirect: true,
        returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
        failureUrl: `${process.env.FRONTEND_URL}/payment-failure`,
        cancelUrl: `${process.env.FRONTEND_URL}/payment-cancel`,
        postAPI: `${process.env.BACKEND_URL}/api/payments/webhook`,
      },
      preferences: {
        integrationType: 1, // E-Commerce portal
        requestCardToken: true,
      },
    };

    const headers = {
      'token': authToken,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(dejavooApiUrl, payload, { headers });

    if (response.data && response.data.information) {
      res.json({ hppUrl: response.data.information });
    } else {
      res.status(500).json({ error: 'Failed to get HPP URL from Dejavoo', details: response.data });
    }
  } catch (error) {
    console.error('Error initiating payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while initiating the payment.' });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const { iposHPResponse } = req.body;
    if (!iposHPResponse) {
      return res.status(400).send('Invalid webhook data');
    }

    const { transactionReferenceId, responseCode, transactionId, rrn, cardToken } = iposHPResponse;

    const transaction = await Transaction.findOne({ transactionReferenceId });
    if (!transaction) {
      return res.status(404).send('Transaction not found');
    }

    if (responseCode === '200') {
      transaction.status = 'success';
      transaction.rrn = rrn; // Save the RRN for future refunds
      if (cardToken) {
        transaction.cardToken = cardToken;
      }
    } else if (responseCode === '401' || responseCode === '402') {
      transaction.status = 'cancelled';
    } else {
      transaction.status = 'failure';
    }
    transaction.dejavooTransactionId = transactionId;
    await transaction.save();

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error handling webhook:', error.message);
    res.status(500).json({ error: 'An error occurred while handling the webhook.' });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const merchant = await Merchant.findOne({ merchantId });
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    const transactions = await Transaction.find({ merchant: merchant._id });
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transaction history:', error.message);
    res.status(500).json({ error: 'An error occurred while getting the transaction history.' });
  }
};

const refundTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount } = req.body;

    const originalTransaction = await Transaction.findById(transactionId).populate('merchant');
    if (!originalTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (originalTransaction.status !== 'success') {
      return res.status(400).json({ error: 'Only successful transactions can be refunded' });
    }

    if (!originalTransaction.rrn) {
      return res.status(400).json({ error: 'Transaction RRN not found' });
    }

    const merchant = originalTransaction.merchant;
    const authToken = merchant.getAuthToken();

    const dejavooApiUrl = 'https://payment.ipospays.tech/api/v1/iposTransact';

    const payload = {
      merchantAuthentication: {
        merchantId: merchant.tpn,
        transactionReferenceId: `refund_${originalTransaction.transactionReferenceId}`,
      },
      transactionRequest: {
        transactionType: 3, // 3 for REFUND
        amount: Math.round(amount * 100),
        rrn: originalTransaction.rrn,
      },
    };

    const headers = {
      'token': authToken,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(dejavooApiUrl, payload, { headers });

    if (response.data && response.data.iposTransactResponse && response.data.iposTransactResponse.responseCode === '200') {
      originalTransaction.status = 'refunded';
      await originalTransaction.save();

      const refundTransaction = new Transaction({
        merchant: merchant._id,
        transactionReferenceId: `refund_${originalTransaction.transactionReferenceId}`,
        amount: -amount,
        status: 'success',
        dejavooTransactionId: response.data.iposTransactResponse.transactionId,
        rrn: response.data.iposTransactResponse.RRN,
      });
      await refundTransaction.save();

      res.json({ message: 'Refund successful', data: response.data.iposTransactResponse });
    } else {
      res.status(500).json({ error: 'Refund failed', details: response.data });
    }
  } catch (error) {
    console.error('Error refunding transaction:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while refunding the transaction.' });
  }
};

const voidTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const originalTransaction = await Transaction.findById(transactionId).populate('merchant');
    if (!originalTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (originalTransaction.status !== 'success') {
      return res.status(400).json({ error: 'Only successful transactions can be voided' });
    }

    if (!originalTransaction.rrn) {
      return res.status(400).json({ error: 'Transaction RRN not found' });
    }

    const merchant = originalTransaction.merchant;
    const authToken = merchant.getAuthToken();

    const dejavooApiUrl = 'https://payment.ipospays.tech/api/v1/iposTransact';

    const payload = {
      merchantAuthentication: {
        merchantId: merchant.tpn,
        transactionReferenceId: `void_${originalTransaction.transactionReferenceId}`,
      },
      transactionRequest: {
        transactionType: 2, // 2 for VOID
        rrn: originalTransaction.rrn,
        amount: originalTransaction.amount * 100,
      },
    };

    const headers = {
      'token': authToken,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(dejavooApiUrl, payload, { headers });

    if (response.data && response.data.iposTransactResponse && response.data.iposTransactResponse.responseCode === '200') {
      originalTransaction.status = 'voided';
      await originalTransaction.save();

      res.json({ message: 'Void successful', data: response.data.iposTransactResponse });
    } else {
      res.status(500).json({ error: 'Void failed', details: response.data });
    }
  } catch (error) {
    console.error('Error voiding transaction:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while voiding the transaction.' });
  }
};

const preAuthPayment = async (req, res) => {
  const { merchantId, cardToken, amount } = req.body;

  try {
    const merchant = await Merchant.findOne({ merchantId });
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    const authToken = merchant.getAuthToken();

    const transactionData = {
      merchantAuthentication: {
        merchantId: merchant.tpn,
        transactionReferenceId: `preauth_${Date.now()}`
      },
      transactionRequest: {
        transactionType: 5, // 5 = PreAuth
        cardToken: cardToken,
        amount: Math.round(amount * 100).toString()
      },
      preferences: {
        requestCardToken: true
      }
    };

    const response = await axios.post('https://payment.ipospays.tech/api/v1/iposTransact', transactionData, {
      headers: { 'token': authToken }
    });

    if (response.data.iposTransactResponse && response.data.iposTransactResponse.responseCode === '200') {
        const transaction = new Transaction({
            merchant: merchant._id,
            amount: amount,
            status: 'pre-authorized',
            transactionReferenceId: transactionData.merchantAuthentication.transactionReferenceId,
            rrn: response.data.iposTransactResponse.RRN,
            cardToken: response.data.iposTransactResponse.chdToken || cardToken,
        });
        await transaction.save();
    }

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error pre-authorizing payment', error: error.message });
  }
};

const capturePayment = async (req, res) => {
  const { merchantId, rrn, amount } = req.body;

  try {
    const merchant = await Merchant.findOne({ merchantId });
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    const authToken = merchant.getAuthToken();

    const transactionData = {
      merchantAuthentication: {
        merchantId: merchant.tpn,
        transactionReferenceId: `capture_${Date.now()}`
      },
      transactionRequest: {
        transactionType: 6, // 6 = Ticket (Capture)
        rrn: rrn,
        amount: Math.round(amount * 100).toString()
      }
    };

    const response = await axios.post('https://payment.ipospays.tech/api/v1/iposTransact', transactionData, {
      headers: { 'token': authToken }
    });

    if (response.data.iposTransactResponse && response.data.iposTransactResponse.responseCode === '200') {
        await Transaction.findOneAndUpdate({ rrn: rrn, merchant: merchant._id }, { status: 'captured' });
    }

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error capturing payment', error: error.message });
  }
};

module.exports = {
  initiatePayment,
  handleWebhook,
  getTransactionHistory,
  refundTransaction,
  voidTransaction,
  preAuthPayment,
  capturePayment,
};
