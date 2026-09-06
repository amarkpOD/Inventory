const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// @route   GET /api/transactions
// @desc    Get transaction history (Sell & Add) with filters & date ranges
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 500 } = req.query;

    let query = {};

    // Filter by Transaction Type (SELL, ADD, or ALL)
    if (type && type !== 'ALL') {
      query.type = type.toUpperCase();
    }

    // Filter by Date Range (startDate & endDate)
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end of the selected endDate day (23:59:59)
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = eDate;
      }
    } else {
      // Default: Last 30 Days if no date specified
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
});

module.exports = router;
