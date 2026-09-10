const path = require('path');
const dotenv = require('dotenv');

// Load env BEFORE models so MONGO_DB_NAME / ITEMS_COLLECTION apply correctly.
// APP_ENV=testing → .env.testing | production → .env.production | default → .env
const appEnv =
  process.env.APP_ENV ||
  (process.env.NODE_ENV === 'production' ? 'production' : 'development');
const envFiles = {
  testing: '.env.testing',
  production: '.env.production',
  development: '.env',
};
const chosen = envFiles[appEnv] || '.env';
dotenv.config({ path: path.join(__dirname, chosen) });
// Local fallback — never override production Render env with a Testing .env
if (appEnv === 'testing') {
  dotenv.config({ path: path.join(__dirname, '.env') });
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const seedInitialData = require('./utils/seedData');

const app = express();
const dbName = process.env.MONGO_DB_NAME || 'Inventory';
const itemsCollection = process.env.ITEMS_COLLECTION || 'Inventory';

connectDB().then(async () => {
  await seedInitialData();
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'Inventory System API',
    status: 'Active',
    env: process.env.APP_ENV || process.env.NODE_ENV || 'development',
    database: dbName,
    itemsCollection,
    message:
      dbName === 'Testing'
        ? 'Running against Testing DB — production data is safe'
        : 'Running against production Inventory DB',
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
    env: process.env.APP_ENV || process.env.NODE_ENV || 'development',
    database: dbName,
    itemsCollection,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(
    `🚀 Inventory API on :${PORT} | env=${process.env.APP_ENV || 'development'} | db=${dbName} | items=${itemsCollection}`
  );
});
