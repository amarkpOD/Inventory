const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/items/stats
// @desc    Get dashboard analytics & statistics (sales, totals, quantity desc ranking)
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const items = await Item.find({});

    const totalItems = items.length;
    let totalQuantity = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    items.forEach((item) => {
      totalQuantity += item.quantity;
      totalValue += item.quantity * item.unitPrice;

      if (item.quantity === 0) {
        outOfStockCount += 1;
      } else if (item.quantity <= item.reorderLevel) {
        lowStockCount += 1;
      }
    });

    // 1. Calculate Sales Totals (Today, Weekly, Monthly)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const salesTransactions = await Transaction.find({ type: 'SELL' });

    let todaySellValue = 0;
    let weeklySellValue = 0;
    let monthlySellValue = 0;

    salesTransactions.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      if (txDate >= startOfToday) todaySellValue += tx.totalAmount;
      if (txDate >= sevenDaysAgo) weeklySellValue += tx.totalAmount;
      if (txDate >= thirtyDaysAgo) monthlySellValue += tx.totalAmount;
    });

    // 2. Priority Low Stock alerts
    const alerts = items
      .filter((item) => item.quantity <= item.reorderLevel)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 10);

    // 3. Items sorted in Descending Order by Quantity
    const itemsByQuantityDesc = [...items].sort((a, b) => b.quantity - a.quantity);

    // 4. Recent updates
    const recentUpdates = [...items]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 8);

    res.json({
      totalItems,
      totalQuantity,
      totalValue,
      lowStockCount,
      outOfStockCount,
      inStockCount: totalItems - (lowStockCount + outOfStockCount),
      todaySellValue,
      weeklySellValue,
      monthlySellValue,
      itemsByQuantityDesc,
      alerts,
      recentUpdates,
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ message: 'Failed to retrieve stats', error: error.message });
  }
});

// @route   POST /api/items/bulk-delete
// @desc    Bulk delete multiple items
// @access  Private (Admin Only)
router.post('/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No item IDs provided for bulk delete' });
    }

    const result = await Item.deleteMany({ _id: { $in: ids } });
    res.json({
      message: `Successfully deleted ${result.deletedCount} item(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ message: 'Failed to bulk delete items', error: error.message });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item details' });
  }
});

// @route   GET /api/items
// @desc    Get all items with search, filter, sorting & pagination
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = req.query;

    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { supplier: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const items = await Item.find(query);

    let filteredItems = items;
    if (status && status !== 'All') {
      filteredItems = items.filter((item) => item.status === status);
    }

    filteredItems.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'status') {
        valA = a.status;
        valB = b.status;
      } else if (sortBy === 'totalValue') {
        valA = a.totalValue;
        valB = b.totalValue;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + limitNum);

    const allCategories = Array.from(new Set(items.map((i) => i.category))).filter(Boolean);

    res.json({
      items: paginatedItems,
      totalCount: filteredItems.length,
      page: pageNum,
      totalPages: Math.ceil(filteredItems.length / limitNum) || 1,
      categories: allCategories,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to retrieve items', error: error.message });
  }
});

// @route   POST /api/items
// @desc    Add a new inventory item
// @access  Private (Admin & Worker)
router.post('/', protect, async (req, res) => {
  try {
    const { sku, name, category, quantity, unitPrice, reorderLevel, supplier, description, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Item Name is required' });
    }

    const finalSku = (sku && sku.trim()) ? sku.trim().toUpperCase() : `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    const newItem = await Item.create({
      sku: finalSku,
      name,
      category: category || 'General',
      quantity: Number(quantity) || 0,
      unitPrice: Number(unitPrice) || 0,
      reorderLevel: Number(reorderLevel) || 5,
      supplier: supplier || 'Internal Warehouse',
      description,
      imageUrl,
      lastUpdatedBy: `${req.user.name} (${req.user.role})`,
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Failed to create item', error: error.message });
  }
});

// @route   PUT /api/items/:id
// @desc    Update an inventory item
// @access  Private (Admin & Worker)
router.put('/:id', protect, async (req, res) => {
  try {
    const { sku, name, category, quantity, unitPrice, reorderLevel, supplier, description, imageUrl } = req.body;

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (sku && sku.trim().toUpperCase() !== item.sku) {
      const skuCheck = await Item.findOne({ sku: sku.trim().toUpperCase() });
      if (skuCheck) {
        return res.status(400).json({ message: `SKU '${sku}' is already in use by another item` });
      }
      item.sku = sku.trim().toUpperCase();
    }

    if (name !== undefined) item.name = name;
    if (category !== undefined) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unitPrice !== undefined) item.unitPrice = Number(unitPrice);
    if (reorderLevel !== undefined) item.reorderLevel = Number(reorderLevel);
    if (supplier !== undefined) item.supplier = supplier;
    if (description !== undefined) item.description = description;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    item.lastUpdatedBy = `${req.user.name} (${req.user.role})`;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Failed to update item', error: error.message });
  }
});

router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const { adjustment, newQuantity, note, customUnitPrice, unitPrice, updateMasterPrice } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const effectiveUnitPrice = customUnitPrice !== undefined
      ? Number(customUnitPrice)
      : unitPrice !== undefined
      ? Number(unitPrice)
      : item.unitPrice;

    if (updateMasterPrice && effectiveUnitPrice >= 0) {
      item.unitPrice = effectiveUnitPrice;
    }

    let diff = 0;
    if (newQuantity !== undefined) {
      diff = Number(newQuantity) - item.quantity;
      item.quantity = Math.max(0, Number(newQuantity));
    } else if (adjustment !== undefined) {
      diff = Number(adjustment);
      item.quantity = Math.max(0, item.quantity + Number(adjustment));
    }

    // Log transaction if selling (negative diff) or adding (positive diff)
    if (diff < 0) {
      const soldQty = Math.abs(diff);
      await Transaction.create({
        type: 'SELL',
        item: item._id,
        itemName: item.name,
        quantity: soldQty,
        unitPrice: effectiveUnitPrice,
        totalAmount: soldQty * effectiveUnitPrice,
        performedBy: `${req.user.name} (${req.user.role})`,
      });
    } else if (diff > 0) {
      await Transaction.create({
        type: 'ADD',
        item: item._id,
        itemName: item.name,
        quantity: diff,
        unitPrice: effectiveUnitPrice,
        totalAmount: diff * effectiveUnitPrice,
        performedBy: `${req.user.name} (${req.user.role})`,
      });
    }

    item.lastUpdatedBy = `${req.user.name} (${req.user.role}) - ${note || 'Stock adjust'}`;
    const updatedItem = await item.save();

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Stock update failed', error: error.message });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Failed to delete item', error: error.message });
  }
});

module.exports = router;
