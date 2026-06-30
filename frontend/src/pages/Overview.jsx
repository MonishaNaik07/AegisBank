import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  actionStart, 
  actionFailure, 
  fetchAccountsSuccess, 
  fetchRequestsSuccess, 
  fetchTransactionsSuccess,
  addAccountRequestSuccess,
  depositWithdrawSuccess
} from '../redux/slices/accountSlice.js';
import api from '../services/api.js';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

const Overview = () => {
  const dispatch = useDispatch();
  const { accounts, requests, transactions, loading, error } = useSelector((state) => state.account);
  const { user } = useSelector((state) => state.auth);

  // Modals state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState('deposit'); // 'deposit' or 'withdraw'
  
  // Form states
  const [applyData, setApplyData] = useState({ accountType: 'Savings', initialDeposit: 500 });
  const [txData, setTxData] = useState({ accountNumber: '', amount: '', remarks: '' });
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    dispatch(actionStart());
    try {
      const [accRes, reqRes, txnRes] = await Promise.all([
        api.get('/accounts/my'),
        api.get('/accounts/requests'),
        api.get('/transactions/my')
      ]);
      
      dispatch(fetchAccountsSuccess(accRes.data.accounts));
      dispatch(fetchRequestsSuccess(reqRes.data.requests));
      dispatch(fetchTransactionsSuccess(txnRes.data.transactions));
    } catch (err) {
      dispatch(actionFailure(err.response?.data?.message || 'Failed to fetch account info'));
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleApplyChange = (e) => {
    setApplyData({ ...applyData, [e.target.name]: e.target.value });
  };

  const handleTxChange = (e) => {
    setTxData({ ...txData, [e.target.name]: e.target.value });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');
    
    if (applyData.initialDeposit < 500) {
      setFormError('Initial deposit must be at least $500');
      return;
    }

    dispatch(actionStart());
    try {
      const response = await api.post('/accounts/request', applyData);
      if (response.data.success) {
        dispatch(addAccountRequestSuccess(response.data.request));
        setSuccessMsg('Account application submitted successfully!');
        setApplyData({ accountType: 'Savings', initialDeposit: 500 });
        setTimeout(() => {
          setShowApplyModal(false);
          setSuccessMsg('');
        }, 1500);
        loadData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit application');
      dispatch(actionFailure(err.response?.data?.message || 'Application failed'));
    }
  };

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!txData.accountNumber) {
      setFormError('Please select a bank account');
      return;
    }
    if (!txData.amount || Number(txData.amount) <= 0) {
      setFormError('Please enter a valid amount greater than 0');
      return;
    }

    dispatch(actionStart());
    try {
      const endpoint = txType === 'deposit' ? '/transactions/deposit' : '/transactions/withdraw';
      const response = await api.post(endpoint, {
        accountNumber: txData.accountNumber,
        amount: Number(txData.amount),
        remarks: txData.remarks
      });

      if (response.data.success) {
        dispatch(depositWithdrawSuccess({
          account: response.data.account,
          transaction: response.data.transaction
        }));
        setSuccessMsg(`${txType === 'deposit' ? 'Deposit' : 'Withdrawal'} executed successfully!`);
        setTxData({ accountNumber: '', amount: '', remarks: '' });
        
        setTimeout(() => {
          setShowTxModal(false);
          setSuccessMsg('');
        }, 1500);
        
        loadData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || `Failed to execute ${txType}`);
      dispatch(actionFailure(err.response?.data?.message || 'Transaction failed'));
    }
  };

  const openTxModal = (type) => {
    setTxType(type);
    setTxData({
      accountNumber: accounts[0]?.accountNumber || '',
      amount: '',
      remarks: ''
    });
    setFormError('');
    setSuccessMsg('');
    setShowTxModal(true);
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.status === 'active' ? curr.balance : 0), 0);
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Top Banner Details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-dark-900 dark:text-white">Overview</h1>
          <p className="text-sm text-dark-500">Manage your active accounts and recent financial ledger transactions.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setApplyData({ accountType: 'Savings', initialDeposit: 500 });
              setFormError('');
              setSuccessMsg('');
              setShowApplyModal(true);
            }}
            disabled={accounts.length >= 3 || pendingRequests.length > 0}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Account</span>
          </button>
        </div>
      </div>

      {/* Global Error message */}
      {error && !showApplyModal && !showTxModal && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Widget Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="glass-card bg-gradient-to-br from-brand-600 to-indigo-700 dark:from-brand-900/60 dark:to-indigo-950/60 text-white border-none p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10" />
          <p className="text-xs uppercase tracking-widest text-brand-100 font-semibold">Total Combined Balance</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-1.5">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <div className="flex items-center gap-1.5 mt-4 text-xs bg-white/10 w-fit px-2.5 py-1 rounded-full border border-white/10">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across {accounts.filter(a => a.status === 'active').length} active accounts</span>
          </div>
        </div>

        {/* Action Quick Panel */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-dark-800 dark:text-white">Quick Actions</h3>
            <p className="text-xs text-dark-400">Perform standard cash deposits or withdrawals instantly.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => openTxModal('deposit')}
              disabled={accounts.length === 0}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800/60 transition group disabled:opacity-40 disabled:pointer-events-none"
            >
              <ArrowDownLeft className="w-6 h-6 text-success-500 mb-1 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold">Deposit</span>
            </button>
            <button
              onClick={() => openTxModal('withdraw')}
              disabled={accounts.length === 0}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800/60 transition group disabled:opacity-40 disabled:pointer-events-none"
            >
              <ArrowUpRight className="w-6 h-6 text-danger-500 mb-1 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold">Withdraw</span>
            </button>
          </div>
        </div>

        {/* Requests Status Card */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-dark-800 dark:text-white">Application Pipeline</h3>
            <p className="text-xs text-dark-400">Status of your submitted account applications.</p>
          </div>

          <div className="mt-4 flex-1 flex flex-col justify-center">
            {requests.length === 0 ? (
              <p className="text-xs text-dark-400 text-center italic">No submissions made yet.</p>
            ) : (
              <div className="space-y-2.5">
                {requests.slice(0, 2).map((req) => (
                  <div key={req._id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-dark-100 dark:bg-dark-800/50">
                    <div className="font-medium">{req.accountType} (Init: ${req.initialDeposit})</div>
                    <div className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase ${
                      req.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                      'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                    }`}>
                      {req.status === 'pending' && <Clock className="w-3 h-3" />}
                      {req.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      <span>{req.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Listings */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-dark-800 dark:text-white">Your Bank Accounts</h3>
        {accounts.length === 0 ? (
          <div className="glass-card text-center py-10 border-dashed border-2 border-dark-200 dark:border-dark-800">
            <DollarSign className="w-12 h-12 text-dark-300 dark:text-dark-700 mx-auto mb-3" />
            <h4 className="font-bold text-dark-700 dark:text-dark-300">No Bank Accounts Found</h4>
            <p className="text-xs text-dark-500 max-w-xs mx-auto mt-1 mb-4">You need to submit an application for an account and wait for admin approval to begin banking operations.</p>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg text-xs font-bold"
            >
              Apply Now
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <div key={acc._id} className="glass-card relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${acc.status === 'active' ? 'bg-success-500' : 'bg-danger-500'}`} />
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-dark-800 dark:text-white">{acc.accountType}</h4>
                    <p className="text-xs text-dark-400 mt-0.5 font-mono">{acc.accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3')}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    acc.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                  }`}>
                    {acc.status}
                  </span>
                </div>
                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-dark-400 font-semibold block uppercase">Balance</span>
                    <span className="text-2xl font-bold text-dark-800 dark:text-white">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-dark-800 dark:text-white">Recent Transactions</h3>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-dark-200/50 dark:border-dark-800/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-100/50 dark:bg-dark-900/30 text-xs font-semibold uppercase text-dark-400 border-b border-dark-200/50 dark:border-dark-800/50">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Sender / Receiver</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200/50 dark:divide-dark-800/50 text-sm">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-dark-400 italic">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.slice(0, 5).map((tx) => {
                    const isSender = accounts.some(a => a.accountNumber === tx.senderAccount);
                    const isReceiver = accounts.some(a => a.accountNumber === tx.receiverAccount);
                    
                    let typeText = 'Transfer';
                    if (tx.type === 'deposit') typeText = 'Deposit';
                    else if (tx.type === 'withdraw') typeText = 'Withdrawal';

                    let amountColor = 'text-dark-800 dark:text-dark-100';
                    let amountPrefix = '';
                    
                    if (tx.type === 'deposit') {
                      amountColor = 'text-success-500 font-semibold';
                      amountPrefix = '+';
                    } else if (tx.type === 'withdraw') {
                      amountColor = 'text-danger-500 font-semibold';
                      amountPrefix = '-';
                    } else if (tx.type === 'transfer') {
                      if (isSender) {
                        amountColor = 'text-danger-500 font-semibold';
                        amountPrefix = '-';
                      } else if (isReceiver) {
                        amountColor = 'text-success-500 font-semibold';
                        amountPrefix = '+';
                      }
                    }

                    return (
                      <tr key={tx._id} className="hover:bg-dark-100/20 dark:hover:bg-dark-900/10">
                        <td className="px-6 py-4 font-mono font-medium text-xs text-dark-500">{tx.transactionId}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            tx.type === 'deposit' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            tx.type === 'withdraw' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                            'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                            {typeText}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-dark-500">
                          {tx.type === 'transfer' ? (
                            <span>{tx.senderAccount} &rarr; {tx.receiverAccount}</span>
                          ) : tx.type === 'deposit' ? (
                            <span>Self &rarr; {tx.receiverAccount}</span>
                          ) : (
                            <span>{tx.senderAccount} &rarr; Self</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-dark-600 dark:text-dark-400">{tx.remarks}</td>
                        <td className="px-6 py-4 text-xs text-dark-400">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${amountColor}`}>
                          {amountPrefix}${tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* APPLY FOR ACCOUNT MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-dark-200 dark:border-dark-800 overflow-hidden transform transition-all duration-300">
            <div className="px-6 py-4 border-b border-dark-200/50 dark:border-dark-800/50 flex justify-between items-center">
              <h3 className="font-bold text-dark-800 dark:text-white">Apply for a New Bank Account</h3>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-850"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-dark-500 block">Account Type</label>
                <select
                  name="accountType"
                  value={applyData.accountType}
                  onChange={handleApplyChange}
                  className="glass-input"
                >
                  <option value="Savings">Savings Account</option>
                  <option value="Checking">Checking Account</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-dark-500 block">Initial Deposit ($)</label>
                <input
                  type="number"
                  name="initialDeposit"
                  value={applyData.initialDeposit}
                  onChange={handleApplyChange}
                  min="500"
                  className="glass-input"
                />
                <span className="text-[10px] text-dark-400">Minimum initial deposit is $500.00</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Submit Application</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DEPOSIT / WITHDRAW MODAL */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-dark-200 dark:border-dark-800 overflow-hidden transform transition-all duration-300">
            <div className="px-6 py-4 border-b border-dark-200/50 dark:border-dark-800/50 flex justify-between items-center">
              <h3 className="font-bold text-dark-800 dark:text-white capitalize">{txType} Funds</h3>
              <button 
                onClick={() => setShowTxModal(false)}
                className="p-1 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-850"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleTxSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-dark-500 block">Select Account</label>
                <select
                  name="accountNumber"
                  value={txData.accountNumber}
                  onChange={handleTxChange}
                  className="glass-input"
                >
                  {accounts.map(a => (
                    <option key={a._id} value={a.accountNumber}>
                      {a.accountType} ({a.accountNumber}) - Balance: ${a.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-dark-500 block">Amount ($)</label>
                <input
                  type="number"
                  name="amount"
                  value={txData.amount}
                  onChange={handleTxChange}
                  placeholder="0.00"
                  min="1"
                  step="any"
                  className="glass-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-dark-500 block">Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  value={txData.remarks}
                  onChange={handleTxChange}
                  placeholder="e.g. Savings deposit, cash withdraw"
                  className="glass-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="capitalize">Execute {txType}</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
