const crypto = require('crypto-js');
const dotenv = require('dotenv');

dotenv.config();

const encrypt = (text) => {
  return crypto.AES.encrypt(text, process.env.ENCRYPTION_KEY).toString();
};

const decrypt = (ciphertext) => {
  const bytes = crypto.AES.decrypt(ciphertext, process.env.ENCRYPTION_KEY);
  return bytes.toString(crypto.enc.Utf8);
};

module.exports = { encrypt, decrypt };
