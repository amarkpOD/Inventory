const User = require('../models/User');

/**
 * Ensures default login accounts exist.
 * Does NOT seed inventory/transaction sample data.
 */
const seedInitialData = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        username: 'admin',
        email: 'admin@inventory.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Seeded default Admin account (admin / admin123)');
    }

    const workerExists = await User.findOne({ username: 'worker' });
    if (!workerExists) {
      await User.create({
        name: 'Warehouse Worker',
        username: 'worker',
        email: 'worker@inventory.com',
        password: 'worker123',
        role: 'worker',
      });
      console.log('Seeded default Worker account (worker / worker123)');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error.message);
  }
};

module.exports = seedInitialData;
