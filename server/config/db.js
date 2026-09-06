const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://amarkp108:Amar9507@user.rsdmh.mongodb.net/Inventory?appName=User', {
      dbName: 'Inventory',
    });
    console.log(`MongoDB Connected: ${conn.connection.host} | Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
