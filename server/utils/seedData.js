const User = require('../models/User');
const Item = require('../models/Item');

const seedInitialData = async () => {
  try {
    // 1. Seed Users (Admin & Worker)
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

    // 2. Seed Sample Inventory items if collection is empty
    const itemCounts = await Item.countDocuments();
    if (itemCounts === 0) {
      const sampleItems = [
        {
          sku: 'INV-1001',
          name: 'Logitech MX Master 3S Wireless Mouse',
          category: 'Electronics',
          quantity: 42,
          unitPrice: 99.99,
          reorderLevel: 10,
          supplier: 'TechLogix Distribution',
          description: 'Ergonomic precision wireless mouse with quiet click switches.',
          imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80',
          lastUpdatedBy: 'System Admin (admin)',
        },
        {
          sku: 'INV-1002',
          name: 'Dell UltraSharp 27" 4K USB-C Monitor',
          category: 'Electronics',
          quantity: 18,
          unitPrice: 480.0,
          reorderLevel: 5,
          supplier: 'Dell Enterprise Direct',
          description: 'IPS 4K monitor with 99% sRGB, height adjustable stand.',
          imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
          lastUpdatedBy: 'System Admin (admin)',
        },
        {
          sku: 'INV-1003',
          name: 'Anker PowerConf Bluetooth Speakerphone',
          category: 'Electronics',
          quantity: 4,
          unitPrice: 129.5,
          reorderLevel: 8, // Low Stock alert!
          supplier: 'Anker Global Supply',
          description: 'Conference speakerphone with 6 microphones and voice enhancement.',
          imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80',
          lastUpdatedBy: 'Warehouse Worker (worker)',
        },
        {
          sku: 'INV-1004',
          name: 'Herman Miller Aeron Ergonomic Chair',
          category: 'Furniture',
          quantity: 0,
          unitPrice: 1250.0,
          reorderLevel: 3, // Out of Stock alert!
          supplier: 'OfficeSpace Solutions',
          description: 'Full posture mesh executive office chair with lumbar support.',
          imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1209?w=400&q=80',
          lastUpdatedBy: 'System Admin (admin)',
        },
        {
          sku: 'INV-1005',
          name: 'Heavy Duty Thermal Shipping Labels (4x6")',
          category: 'Packaging',
          quantity: 350,
          unitPrice: 12.99,
          reorderLevel: 50,
          supplier: 'PackPro Logistics',
          description: 'Roll of 500 direct thermal shipping labels, water resistant.',
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
          lastUpdatedBy: 'Warehouse Worker (worker)',
        },
        {
          sku: 'INV-1006',
          name: 'Bostitch Heavy Duty Stapler (210 Sheet)',
          category: 'Office Supplies',
          quantity: 6,
          unitPrice: 45.0,
          reorderLevel: 10, // Low Stock alert!
          supplier: 'Staples Business Center',
          description: 'Anti-jamming high volume office desk stapler.',
          imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80',
          lastUpdatedBy: 'Warehouse Worker (worker)',
        },
        {
          sku: 'INV-1007',
          name: 'Cat6 Ethernet Patch Cable 10ft (10 Pack)',
          category: 'Networking',
          quantity: 85,
          unitPrice: 24.99,
          reorderLevel: 20,
          supplier: 'Netlink Depot',
          description: 'RJ45 snagless gigabit network patch cables.',
          imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80',
          lastUpdatedBy: 'System Admin (admin)',
        },
        {
          sku: 'INV-1008',
          name: 'Industrial Aluminum Stepladder 8ft',
          category: 'Hardware',
          quantity: 2,
          unitPrice: 189.0,
          reorderLevel: 4, // Low Stock alert!
          supplier: 'Grainger Supplies',
          description: 'Type IAA 375 lb capacity heavy duty folding stepladder.',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80',
          lastUpdatedBy: 'Warehouse Worker (worker)',
        },
      ];

      await Item.insertMany(sampleItems);
      console.log('Seeded initial sample inventory items into Inventory collection');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error.message);
  }
};

module.exports = seedInitialData;
