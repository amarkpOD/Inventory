/**
 * Clear inventory + transactions; keep users.
 * Testing:  APP_ENV=testing node utils/clearData.js
 * Production (careful!): APP_ENV=production node utils/clearData.js
 */
const path = require('path');
const dotenv = require('dotenv');

const appEnv = process.env.APP_ENV || 'testing';
const envFile =
  appEnv === 'production' ? '.env.production' : appEnv === 'testing' ? '.env.testing' : '.env';
dotenv.config({ path: path.join(__dirname, '..', envFile) });

const mongoose = require('mongoose');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

async function clearData() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || 'Testing';

  if (!uri) {
    throw new Error('MONGO_URI missing — check your env file');
  }

  await mongoose.connect(uri, { dbName });
  console.log(`Connected to DB="${mongoose.connection.name}" | items collection="${process.env.ITEMS_COLLECTION}"`);

  const [itemsBefore, txBefore, usersBefore] = await Promise.all([
    Item.countDocuments(),
    Transaction.countDocuments(),
    User.countDocuments(),
  ]);
  console.log('Before:', { items: itemsBefore, transactions: txBefore, users: usersBefore });

  const [itemsResult, txResult] = await Promise.all([Item.deleteMany({}), Transaction.deleteMany({})]);

  const [itemsAfter, txAfter, usersAfter] = await Promise.all([
    Item.countDocuments(),
    Transaction.countDocuments(),
    User.countDocuments(),
  ]);

  console.log('Deleted items:', itemsResult.deletedCount);
  console.log('Deleted transactions:', txResult.deletedCount);
  console.log('After:', { items: itemsAfter, transactions: txAfter, users: usersAfter });
  console.log('Users/credentials kept intact.');

  await mongoose.disconnect();
}

clearData().catch((err) => {
  console.error(err);
  process.exit(1);
});
