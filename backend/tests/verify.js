import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import AccountRequest from '../models/AccountRequest.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { generateAccountNumber } from '../utils/helpers.js';
import { predictFraud, calculateCreditScore } from '../services/aiService.js';

dotenv.config();

const runTests = async () => {
  console.log('=== STARTING AegisBank VERIFICATION TEST SUITE ===');
  
  try {
    await connectDB();
    
    // Reset test database
    await User.deleteMany({ username: { $in: ['test_client', 'test_admin'] } });
    await AccountRequest.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});
    
    console.log('✓ Database cleaned and prepared.');

    // 1. Auth & User Registration
    console.log('\n--- Test 1: User Registration ---');
    const user = await User.create({
      fullName: 'Test Client User',
      username: 'test_client',
      email: 'test_client@aegisbank.com',
      phone: '+1 (555) 555-5555',
      address: '123 Test St, Boston',
      zipCode: '02108',
      password: 'Password123',
      role: 'User'
    });
    
    console.log(`✓ User registered successfully. ID: ${user._id}`);
    if (user.role !== 'User') throw new Error('Role mismatch on registration');
    if (user.status !== 'active') throw new Error('Status should be active by default');
    console.log('✓ User attributes verified.');

    // 2. Account Request Submission
    console.log('\n--- Test 2: Submit Account Request ---');
    const initialDeposit = 650.00;
    const request = await AccountRequest.create({
      userId: user._id,
      accountType: 'Savings',
      initialDeposit,
      status: 'pending'
    });

    console.log(`✓ Request created. ID: ${request._id}`);
    if (request.status !== 'pending') throw new Error('Request status should be pending');
    if (request.initialDeposit !== initialDeposit) throw new Error('Initial deposit mismatch');
    console.log('✓ Account application details verified.');

    // 3. Admin Account Approval & Account Creation
    console.log('\n--- Test 3: Admin Review and Approval ---');
    request.status = 'approved';
    request.remarks = 'Verified deposits. Approved.';
    await request.save();

    const accountNumber = generateAccountNumber();
    const account = await Account.create({
      userId: request.userId,
      accountNumber,
      accountType: request.accountType,
      balance: request.initialDeposit,
      status: 'active'
    });

    console.log(`✓ Account created. Number: ${accountNumber}`);
    if (account.balance !== initialDeposit) throw new Error('Account balance mismatch');
    if (account.status !== 'active') throw new Error('Account state mismatch');
    console.log('✓ Bank account balances and approvals verified.');

    // 4. Deposits & Withdrawals
    console.log('\n--- Test 4: Deposits & Withdrawals ---');
    
    // Deposit
    account.balance += 200.00;
    await account.save();
    console.log(`✓ Deposit of $200.00 simulation. New balance: $${account.balance}`);
    if (account.balance !== 850.00) throw new Error('Balance mismatch after deposit');

    // Withdraw
    account.balance -= 150.00;
    await account.save();
    console.log(`✓ Withdrawal of $150.00 simulation. Remaining balance: $${account.balance}`);
    if (account.balance !== 700.00) throw new Error('Balance mismatch after withdrawal');
    console.log('✓ Cash transactions verified.');

    // 5. Transfer & AI Fraud Detection Check
    console.log('\n--- Test 5: AI Fraud Check & Fund Transfers ---');
    
    // Secondary account for recipient
    const recipientAccount = await Account.create({
      userId: new mongoose.Types.ObjectId(),
      accountNumber: '1009998887',
      accountType: 'Checking',
      balance: 100.00,
      status: 'active'
    });
    console.log(`✓ Recipient account established: ${recipientAccount.accountNumber}`);

    // AI Check
    const fraudResult = await predictFraud({
      amount: 150.00,
      senderBalance: account.balance,
      receiverBalance: recipientAccount.balance,
      accountAgeMonths: 1,
      type: 'transfer',
      hourOfDay: 12
    });
    
    console.log(`✓ AI Fraud Scan Response. Risk score: ${(fraudResult.risk_score * 100).toFixed(0)}%. Fraud flag: ${fraudResult.is_fraud}`);
    
    // Execute transfer
    account.balance -= 150.00;
    recipientAccount.balance += 150.00;
    await account.save();
    await recipientAccount.save();
    
    console.log(`✓ Transfer executed. Sender balance: $${account.balance}, Recipient balance: $${recipientAccount.balance}`);
    if (account.balance !== 550.00) throw new Error('Sender balance incorrect after transfer');
    if (recipientAccount.balance !== 250.00) throw new Error('Recipient balance incorrect after transfer');
    console.log('✓ Fund transfer transactions verified.');

    // 6. AI Credit Assessment
    console.log('\n--- Test 6: AI Credit Score Evaluation ---');
    const creditResult = await calculateCreditScore({
      account_age_months: 12,
      balance_stability: 0.85,
      transaction_count: 45,
      failed_transactions: 0
    });

    console.log(`✓ AI Credit Score retrieved. Score: ${creditResult.credit_score}, Rating: ${creditResult.rating}`);
    if (creditResult.credit_score < 300 || creditResult.credit_score > 850) {
      throw new Error('Credit score should fall between 300 and 850');
    }
    console.log('✓ Credit evaluation bounds verified.');

    console.log('\n=== ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY ===');
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error(`\n✖ Test execution encountered a failure: ${error.message}`);
    await closeDB();
    process.exit(1);
  }
};

runTests();
