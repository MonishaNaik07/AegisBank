import mongoose from 'mongoose';

const accountRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountType: {
      type: String,
      enum: ['Savings', 'Checking'],
      default: 'Savings',
    },
    initialDeposit: {
      type: Number,
      required: true,
      min: [500, 'Initial deposit must be at least 500'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const AccountRequest = mongoose.model('AccountRequest', accountRequestSchema);
export default AccountRequest;
