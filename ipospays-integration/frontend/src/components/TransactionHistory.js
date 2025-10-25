import React, { useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [merchantId, setMerchantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalType, setModalType] = useState(''); // 'refund', 'void', 'capture'
  const [refundAmount, setRefundAmount] = useState('');

  const fetchTransactions = async () => {
    if (!merchantId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/payments/history/${merchantId}`);
      setTransactions(res.data);
    } catch (err) {
      console.error(err.response.data);
    }
    setLoading(false);
  };

  const openModal = (transaction, type) => {
    setSelectedTransaction(transaction);
    setModalType(type);
    if (type === 'refund') {
      setRefundAmount('');
    }
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setModalType('');
  };

  const handleActionSubmit = async () => {
    if (!selectedTransaction) return;

    const { dejavooTransactionId } = selectedTransaction;
    let url = '';
    let payload = { dejavooTransactionId };

    switch (modalType) {
      case 'refund':
        url = '/api/payments/refund';
        payload.amount = refundAmount;
        break;
      case 'void':
        url = '/api/payments/void';
        break;
      case 'capture':
        url = '/api/payments/capture';
        break;
      default:
        return;
    }

    try {
      await axios.post(url, payload);
      alert(`Transaction ${modalType} successful!`);
      fetchTransactions(); // Refresh the transaction list
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      alert(`Error performing ${modalType}: ${err.response ? err.response.data.message : err.message}`);
    } finally {
      closeModal();
    }
  };

  const getActionButtons = (transaction) => {
    switch (transaction.status) {
      case 'approved': // Assuming 'approved' is a status for a sale/auth
        return (
          <>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: 8 }}
              onClick={() => openModal(transaction, 'refund')}
            >
              Refund
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => openModal(transaction, 'void')}
            >
              Void
            </Button>
          </>
        );
      case 'authorized': // Assuming 'authorized' is a status for a pre-auth
        return (
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => openModal(transaction, 'capture')}
          >
            Capture
          </Button>
        );
      default:
        return null;
    }
  };

  const renderModalContent = () => {
    if (!selectedTransaction) return null;

    if (modalType === 'refund') {
      return (
        <Dialog open={true} onClose={closeModal}>
          <DialogTitle>Refund Transaction</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Transaction ID: {selectedTransaction.dejavooTransactionId}
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Refund Amount"
              type="number"
              fullWidth
              variant="standard"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal}>Cancel</Button>
            <Button onClick={handleActionSubmit}>Submit Refund</Button>
          </DialogActions>
        </Dialog>
      );
    }

    return (
      <Dialog open={true} onClose={closeModal}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {modalType} transaction{' '}
            {selectedTransaction.dejavooTransactionId}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleActionSubmit} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transaction History
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <TextField
          label="Enter Merchant ID"
          variant="outlined"
          value={merchantId}
          onChange={(e) => setMerchantId(e.target.value)}
          size="small"
        />
        <Button
          onClick={fetchTransactions}
          disabled={loading}
          variant="contained"
          sx={{ ml: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Get History'}
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction Reference ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Dejavoo Transaction ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{transaction.transactionReferenceId}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{transaction.status}</TableCell>
                <TableCell>{transaction.dejavooTransactionId}</TableCell>
                <TableCell>
                  {new Date(transaction.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{getActionButtons(transaction)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {renderModalContent()}
    </Box>
  );
};

export default TransactionHistory;
