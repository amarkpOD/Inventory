const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      default: () => 'INV-' + Math.floor(100000 + Math.random() * 900000),
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'General',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: [0, 'Reorder level cannot be negative'],
      default: 10,
    },
    supplier: {
      type: String,
      trim: true,
      default: 'Internal Warehouse',
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    lastUpdatedBy: {
      type: String,
      default: 'System',
    },
  },
  {
    timestamps: true,
    collection: 'Inventory', // Exact collection name as requested
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for calculated stock status
itemSchema.virtual('status').get(function () {
  if (this.quantity <= 0) return 'Out of Stock';
  if (this.quantity <= this.reorderLevel) return 'Low Stock';
  return 'In Stock';
});

// Virtual property for total inventory value of this item
itemSchema.virtual('totalValue').get(function () {
  return this.quantity * this.unitPrice;
});

module.exports = mongoose.model('Item', itemSchema);
