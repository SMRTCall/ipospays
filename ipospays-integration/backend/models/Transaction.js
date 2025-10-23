const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  },
  transactionReferenceId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failure', 'cancelled', 'refunded', 'voided', 'authorized'],
    default: 'pending',
  },
  dejavooTransactionId: {
    type: String,
  },
  rrn: {
    type: String,
  },
  cardToken: {
    type: String,
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
