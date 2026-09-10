const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const isProd =
      process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';

    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('MONGO_URI is required. Set it in .env or Render environment variables.');
      process.exit(1);
    }

    const dbName = process.env.MONGO_DB_NAME || (isProd ? 'Inventory' : 'Testing');

    const conn = await mongoose.connect(uri, { dbName });
    console.log(
      `MongoDB Connected: ${conn.connection.host} | Database: ${conn.connection.name} | Items: ${
        process.env.ITEMS_COLLECTION || (isProd ? 'Inventory' : 'Testing')
      }`
    );
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
