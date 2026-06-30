import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accounts: [],
  requests: [],
  transactions: [],
  insights: null,
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    actionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    actionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchAccountsSuccess: (state, action) => {
      state.loading = false;
      state.accounts = action.payload;
    },
    fetchRequestsSuccess: (state, action) => {
      state.loading = false;
      state.requests = action.payload;
    },
    fetchTransactionsSuccess: (state, action) => {
      state.loading = false;
      state.transactions = action.payload;
    },
    fetchInsightsSuccess: (state, action) => {
      state.loading = false;
      state.insights = action.payload;
    },
    addAccountRequestSuccess: (state, action) => {
      state.loading = false;
      state.requests.unshift(action.payload);
    },
    depositWithdrawSuccess: (state, action) => {
      state.loading = false;
      // Update account balance
      const updatedAcc = action.payload.account;
      const index = state.accounts.findIndex(acc => acc.accountNumber === updatedAcc.accountNumber);
      if (index !== -1) {
        state.accounts[index] = updatedAcc;
      }
      if (action.payload.transaction) {
        state.transactions.unshift(action.payload.transaction);
      }
    },
    transferSuccess: (state, action) => {
      state.loading = false;
      const updatedAcc = action.payload.senderAccount;
      const index = state.accounts.findIndex(acc => acc.accountNumber === updatedAcc.accountNumber);
      if (index !== -1) {
        state.accounts[index] = updatedAcc;
      }
      if (action.payload.transaction) {
        state.transactions.unshift(action.payload.transaction);
      }
    },
    clearAccountState: (state) => {
      state.accounts = [];
      state.requests = [];
      state.transactions = [];
      state.insights = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  actionStart,
  actionFailure,
  fetchAccountsSuccess,
  fetchRequestsSuccess,
  fetchTransactionsSuccess,
  fetchInsightsSuccess,
  addAccountRequestSuccess,
  depositWithdrawSuccess,
  transferSuccess,
  clearAccountState,
} = accountSlice.actions;

export default accountSlice.reducer;
