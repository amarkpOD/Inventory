const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const seedInitialData = require('./utils/seedData');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB Atlas
connectDB().then(async () => {
  // Seed admin/worker accounts and sample data if needed
  await seedInitialData();
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/transactions', transactionRoutes);

// Root & Health check endpoints for Render
app.get('/', (req, res) => {
  res.json({
    name: 'Inventory System API',
    status: 'Active',
    message: 'Backend server is running on Render',
    endpoints: {
      health: '/api/health',
      items: '/api/items',
      transactions: '/api/transactions',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'MERN Inventory Management API',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Inventory System API Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
