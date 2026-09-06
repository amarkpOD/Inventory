const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['SELL', 'ADD', 'ADJUST'],
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    performedBy: {
      type: String,
      default: 'System',
    },
  },
  {
    timestamps: true,
    collection: 'transactions',
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
