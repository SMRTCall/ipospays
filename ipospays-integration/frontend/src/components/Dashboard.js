import React, { useState } from 'react';
import axios from 'axios';
import { Typography, Box, Paper, Grid, TextField, Button, CircularProgress } from '@mui/material';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [merchantId, setMerchantId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    if (!merchantId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/payments/history/${merchantId}`);
      const transactions = res.data;
      const totalSales = transactions.reduce((acc, t) => acc + t.amount, 0);
      const totalTransactions = transactions.length;
      setSummary({ totalSales, totalTransactions });
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      // Handle error display to the user
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
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
          onClick={fetchSummary}
          disabled={loading}
          variant="contained"
          sx={{ ml: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Get Summary'}
        </Button>
      </Box>

      {summary && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Total Sales</Typography>
              <Typography variant="h4">${summary.totalSales.toFixed(2)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Total Transactions</Typography>
              <Typography variant="h4">{summary.totalTransactions}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
