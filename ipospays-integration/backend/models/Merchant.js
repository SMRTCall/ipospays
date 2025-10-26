const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const merchantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  merchantId: {
    type: String,
    required: true,
    unique: true,
  },
  tpn: {
    type: String,
    required: true,
  },
  authToken: {
    type: String,
    required: true,
  },
});

// Encrypt the auth token before saving
merchantSchema.pre('save', function (next) {
  if (!this.isModified('authToken')) {
    return next();
  }
  this.authToken = encrypt(this.authToken);
  next();
});

// Method to decrypt the auth token
merchantSchema.methods.getAuthToken = function () {
  return decrypt(this.authToken);
};

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
