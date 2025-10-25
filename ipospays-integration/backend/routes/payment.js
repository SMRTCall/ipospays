const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/initiate', paymentController.initiatePayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/history/:merchantId', paymentController.getTransactionHistory);
router.post('/refund/:transactionId', paymentController.refundTransaction);
router.post('/void/:transactionId', paymentController.voidTransaction);
router.post('/preauth', paymentController.preAuthPayment);
router.post('/capture', paymentController.capturePayment);

module.exports = router;
