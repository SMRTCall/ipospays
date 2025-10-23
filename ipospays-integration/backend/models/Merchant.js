const mongoose = require('mongoose');
const crypto = require('crypto-js');

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
  this.authToken = crypto.AES.encrypt(this.authToken, process.env.ENCRYPTION_KEY).toString();
  next();
});

// Method to decrypt the auth token
merchantSchema.methods.getAuthToken = function () {
  const bytes = crypto.AES.decrypt(this.authToken, process.env.ENCRYPTION_KEY);
  return bytes.toString(crypto.enc.Utf8);
};

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
