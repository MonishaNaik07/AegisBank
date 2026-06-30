import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Account from '../models/Account.js';
import AccountRequest from '../models/AccountRequest.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Account.deleteMany({});
    await AccountRequest.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});

    console.log('Creating users...');

    // 1. Owner (Super Admin)
    const ownerUser = await User.create({
      fullName: 'Super Owner',
      username: 'owner',
      email: 'owner@aegisbank.com',
      phone: '+1 (555) 111-2222',
      address: '100 Aegis Tower, New York',
      zipCode: '10001',
      password: 'Password123',
      role: 'Owner',
      status: 'active'
    });

    // 2. Admin
    const adminUser = await User.create({
      fullName: 'Master Admin',
      username: 'admin',
      email: 'admin@aegisbank.com',
      phone: '+1 (555) 222-3333',
      address: 'Office Branch A, Chicago',
      zipCode: '60601',
      password: 'Password123',
      role: 'Admin',
      status: 'active'
    });

    // Create Admin detail record
    await Admin.create({
      userId: adminUser._id,
      permissions: ['read_users', 'manage_requests', 'view_transactions'],
      createdBy: ownerUser._id
    });

    // 3. Normal User (Client)
    const clientUser = await User.create({
      fullName: 'John Client',
      username: 'user',
      email: 'user@gmail.com',
      phone: '+1 (555) 999-8888',
      address: '456 Elm St, Springfield',
      zipCode: '62701',
      password: 'Password123',
      role: 'User',
      status: 'active'
    });

    console.log('Creating mock bank accounts for user...');

    // John Client Account
    const savingsAccount = await Account.create({
      userId: clientUser._id,
      accountNumber: '1004839201',
      accountType: 'Savings',
      balance: 15450.00,
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    });

    console.log('Creating mock transaction ledger entries...');

    // Transaction 1: Initial Deposit
    await Transaction.create({
      transactionId: 'DEP82390AB',
      receiverAccount: '1004839201',
      amount: 10000.00,
      type: 'deposit',
      status: 'completed',
      remarks: 'Salary Direct Deposit',
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    });

    // Transaction 2: Extra Deposit
    await Transaction.create({
      transactionId: 'DEP82540XY',
      receiverAccount: '1004839201',
      amount: 6000.00,
      type: 'deposit',
      status: 'completed',
      remarks: 'Stock Dividends Deposit',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    });

    // Transaction 3: Cash ATM Withdrawal
    await Transaction.create({
      transactionId: 'WTH93201MN',
      senderAccount: '1004839201',
      amount: 350.00,
      type: 'withdraw',
      status: 'completed',
      remarks: 'ATM Cash Withdrawal',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    });

    // Transaction 4: Mock transfer out (Discretionary Shopping)
    await Transaction.create({
      transactionId: 'TXN72910QA',
      senderAccount: '1004839201',
      receiverAccount: '1000000000', // Mock merchant
      amount: 200.00,
      type: 'transfer',
      status: 'completed',
      isFraudulent: false,
      fraudRiskScore: 0.12,
      remarks: 'Amazon Store Online Shopping',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    // Transaction 5: Mock utility payment (Dining)
    await Transaction.create({
      transactionId: 'TXN82019KK',
      senderAccount: '1004839201',
      receiverAccount: '2000000000', // Mock diner
      amount: 80.00,
      type: 'transfer',
      status: 'completed',
      isFraudulent: false,
      fraudRiskScore: 0.05,
      remarks: 'McDonalds Groceries Dinner',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    console.log('Creating initial notifications...');
    await Notification.create({
      userId: clientUser._id,
      title: 'Welcome to AegisBank!',
      message: 'Your profile has been created successfully. Welcome to next-generation AI e-banking.'
    });

    await Notification.create({
      userId: clientUser._id,
      title: 'Savings Account Activated',
      message: 'Your savings account 1004839201 has been activated with balance $15,450.00.'
    });

    console.log('Database successfully seeded!');
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
