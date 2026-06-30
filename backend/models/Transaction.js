import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    senderAccount: {
      type: String,
      trim: true,
      default: null, // Null for deposits
    },
    receiverAccount: {
      type: String,
      trim: true,
      default: null, // Null for withdrawals
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: true,
      enum: ['deposit', 'withdraw', 'transfer'],
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'pending'],
      default: 'completed',
    },
    remarks: {
      type: String,
      default: '',
    },
    isFraudulent: {
      type: Boolean,
      default: false,
    },
    fraudRiskScore: {
      type: Number,
      default: 0.0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
