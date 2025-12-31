const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-store';

async function initializeDatabase() {
  let client;

  try {
    console.log('Connecting to MongoDB...');
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    console.log('Creating collections...');

    // Create users collection
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // Create transactions collection
    const transactionsCollection = db.collection('transactions');
    await transactionsCollection.createIndex({ billNo: 1 }, { unique: true });
    await transactionsCollection.createIndex({ date: 1 });
    await transactionsCollection.createIndex({ customerName: 1 });

    console.log('Creating demo users...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const employeePassword = await bcrypt.hash('employee123', 12);

    // Create admin user
    await usersCollection.insertOne({
      name: 'Admin User',
      email: 'admin@jewelry.com',
      password: adminPassword,
      role: 'admin',
      phone: '1234567890',
      permissions: {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canViewAll: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create employee user
    await usersCollection.insertOne({
      name: 'Employee User',
      email: 'employee@jewelry.com',
      password: employeePassword,
      role: 'employee',
      phone: '0987654321',
      permissions: {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canViewAll: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Creating sample transaction...');

    const adminUser = await usersCollection.findOne({ email: 'admin@jewelry.com' });
    const employeeUser = await usersCollection.findOne({ email: 'employee@jewelry.com' });

    // Create sample transaction assigned to employee
    await transactionsCollection.insertOne({
      transactionId: 'TXN-20251124-001',
      billNo: '203',
      date: '2025-11-24',
      time: '14:30:00',
      customerName: 'Sample Customer',
      customerPhone: '9876543210',
      status: 'pending',
      assignedTo: employeeUser._id.toString(),
      assignedToName: employeeUser.name,
      items: [
        {
          description: 'BOMBAY RING',
          pcs: 28,
          netWt: 115.599,
          addWt: 0,
          inchIbr: 84.70,
          gold: 110.021,
        },
      ],
      total: {
        pcs: 28,
        netWt: 115.599,
        inchIbr: 84.70,
        gold: 110.021,
      },
      goldBar: {
        weight: 99.50,
        amount: 100.00,
      },
      closingBalance: {
        gold: 110.021,
        cash: 0,
      },
      notes: 'Sample transaction for testing',
      createdBy: adminUser._id.toString(),
      createdByName: adminUser.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('\n✅ Database initialized successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@jewelry.com / admin123');
    console.log('Employee: employee@jewelry.com / employee123');

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

initializeDatabase();
