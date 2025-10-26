const Merchant = require('../models/Merchant');
const { decrypt } = require('../utils/encryption');

const protect = async (req, res, next) => {
  const merchantId = req.headers['x-merchant-id'];
  const authToken = req.headers['x-auth-token'];

  if (!merchantId || !authToken) {
    return res.status(401).json({ message: 'Not authorized, no credentials provided' });
  }

  try {
    const merchant = await Merchant.findOne({ merchantId });

    if (merchant && authToken === decrypt(merchant.authToken)) {
      req.merchant = merchant;
      next();
    } else {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

module.exports = { protect };
