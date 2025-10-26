const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate', paymentController.initiatePayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/history/:merchantId', protect, paymentController.getTransactionHistory);
router.post('/refund/:transactionId', protect, paymentController.refundTransaction);
router.post('/void/:transactionId', protect, paymentController.voidTransaction);
router.post('/preauth', protect, paymentController.preAuthPayment);
router.post('/capture', protect, paymentController.capturePayment);

module.exports = router;
