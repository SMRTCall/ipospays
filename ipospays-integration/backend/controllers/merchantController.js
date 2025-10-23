const Merchant = require('../models/Merchant');

const createMerchant = async (req, res) => {
  try {
    const { name, merchantId, tpn, authToken } = req.body;

    const newMerchant = new Merchant({
      name,
      merchantId,
      tpn,
      authToken,
    });

    await newMerchant.save();

    res.status(201).json({ message: 'Merchant created successfully' });
  } catch (error) {
    console.error('Error creating merchant:', error.message);
    res.status(500).json({ error: 'An error occurred while creating the merchant.' });
  }
};

module.exports = {
  createMerchant,
};
