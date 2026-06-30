import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { 
  ShieldCheck, 
  Users, 
  FileCheck2, 
  ArrowLeftRight, 
  LineChart, 
  UserX, 
  Check, 
  X, 
  AlertTriangle,
  Loader2,
  Lock,
  Unlock,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Review states
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('approved'); // approved / rejected

  const loadRequests = async () => {
    try {
      const response = await api.get('/admin/requests');
      setRequests(response.data.requests);
    } catch (err) {
      setError('Failed to fetch account applications');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to fetch users database');
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await api.get('/admin/transactions');
      setTransactions(response.data.transactions);
    } catch (err) {
      setError('Failed to load transaction ledger');
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data.analytics);
    } catch (err) {
      setError('Failed to compile analytics data');
    }
  };

  const loadTab = async (tab) => {
    setLoading(true);
    setError('');
    
    if (tab === 'requests') await loadRequests();
    else if (tab === 'users') await loadUsers();
    else if (tab === 'transactions') await loadTransactions();
    else if (tab === 'analytics') await loadAnalytics();
    
    setLoading(false);
  };

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab]);

  // Review actions
  const openReviewModal = (req, type) => {
    setSelectedRequest(req);
    setActionType(type);
    setReviewRemarks('');
    setShowRemarksModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      const response = await api.put(`/admin/requests/${selectedRequest._id}`, {
        status: actionType,
        remarks: reviewRemarks
      });

      if (response.data.success) {
        setShowRemarksModal(false);
        loadRequests();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Approval update failed');
    } finally {
      setLoading(false);
    }
  };

  // Status actions
  const handleUpdateStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setLoading(true);
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      if (response.data.success) {
        loadUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  // Delete actions
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this user and all associated accounts?')) return;
    setLoading(true);
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        loadUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-dark-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <span>AegisBank Admin Portal</span>
        </h1>
        <p className="text-sm text-dark-500">Monitor financial risks, review incoming applications, and update account permissions.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex gap-3 items-start animate-shake">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-dark-200 dark:border-dark-800 gap-1 flex-wrap">
        {[
          { id: 'requests', label: 'Account Applications', icon: FileCheck2 },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'transactions', label: 'Ledger Audit', icon: ArrowLeftRight },
          { id: 'analytics', label: 'System Analytics', icon: LineChart },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition duration-150 ${
              activeTab === tab.id
                ? 'border-amber-600 text-amber-600 dark:text-amber-500'
                : 'border-transparent text-dark-500 hover:text-dark-850 dark:hover:text-dark-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {loading && !showRemarksModal ? (
          <div className="h-64 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            {/* Tab: Account Requests */}
            {activeTab === 'requests' && (
              <div className="glass-panel rounded-2xl overflow-hidden border border-dark-200/50 dark:border-dark-800/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-dark-100/50 dark:bg-dark-900/30 text-xs font-semibold text-dark-400 uppercase border-b border-dark-200/50 dark:border-dark-800/50">
                        <th className="px-6 py-4">Applicant</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Account Type</th>
                        <th className="px-6 py-4">Deposit</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-200/50 dark:divide-dark-800/50">
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-dark-400 italic">No account requests found.</td>
                        </tr>
                      ) : (
                        requests.map((req) => (
                          <tr key={req._id} className="hover:bg-dark-100/20 dark:hover:bg-dark-900/10">
                            <td className="px-6 py-4">
                              <div className="font-bold text-dark-800 dark:text-dark-100">{req.userId?.fullName}</div>
                              <div className="text-xs text-dark-400 font-mono">@{req.userId?.username}</div>
                            </td>
                            <td className="px-6 py-4 text-xs text-dark-500">{req.userId?.email}</td>
                            <td className="px-6 py-4 font-semibold">{req.accountType}</td>
                            <td className="px-6 py-4 font-bold text-emerald-500">${req.initialDeposit.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                req.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                                req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {req.status === 'pending' ? (
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => openReviewModal(req, 'approved')}
                                    className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                                    title="Approve"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openReviewModal(req, 'rejected')}
                                    className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                    title="Reject"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-dark-400 italic font-medium">{req.remarks || 'No Comments'}</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: User Directory */}
            {activeTab === 'users' && (
              <div className="glass-panel rounded-2xl overflow-hidden border border-dark-200/50 dark:border-dark-800/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-dark-100/50 dark:bg-dark-900/30 text-xs font-semibold text-dark-400 uppercase border-b border-dark-200/50 dark:border-dark-800/50">
                        <th className="px-6 py-4">User Details</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-200/50 dark:divide-dark-800/50">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-dark-400 italic">No users found.</td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u._id} className="hover:bg-dark-100/20 dark:hover:bg-dark-900/10">
                            <td className="px-6 py-4">
                              <div className="font-bold text-dark-800 dark:text-dark-100">{u.fullName}</div>
                              <div className="text-xs text-dark-400 font-mono">@{u.username}</div>
                            </td>
                            <td className="px-6 py-4 text-xs text-dark-500">
                              <div>{u.email}</div>
                              <div>{u.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold capitalize ${
                                u.role === 'Owner' ? 'bg-purple-100 text-purple-700' :
                                u.role === 'Admin' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                u.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                u.status === 'suspended' ? 'bg-rose-100 text-rose-700' :
                                'bg-dark-200 text-dark-700'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {u.role !== 'Owner' && (
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => handleUpdateStatus(u._id, u.status)}
                                    className={`p-1.5 text-white rounded-lg transition ${
                                      u.status === 'active' 
                                        ? 'bg-rose-500 hover:bg-rose-600' 
                                        : 'bg-emerald-500 hover:bg-emerald-600'
                                    }`}
                                    title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                                  >
                                    {u.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u._id)}
                                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                                    title="Delete User"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Transaction Ledger Auditing */}
            {activeTab === 'transactions' && (
              <div className="glass-panel rounded-2xl overflow-hidden border border-dark-200/50 dark:border-dark-800/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-dark-100/50 dark:bg-dark-900/30 text-xs font-semibold text-dark-400 uppercase border-b border-dark-200/50 dark:border-dark-800/50">
                        <th className="px-6 py-4">Transaction ID</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Sender / Receiver</th>
                        <th className="px-6 py-4">AI Risk Check</th>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-200/50 dark:divide-dark-800/50">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-dark-400 italic">No transactions found.</td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx._id} className="hover:bg-dark-100/20 dark:hover:bg-dark-900/10">
                            <td className="px-6 py-4 font-mono font-medium text-xs text-dark-500">{tx.transactionId}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' :
                                tx.type === 'withdraw' ? 'bg-rose-50 text-rose-600' :
                                'bg-blue-50 text-blue-600'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-dark-500">
                              {tx.type === 'transfer' ? (
                                <span>{tx.senderAccount} &rarr; {tx.receiverAccount}</span>
                              ) : tx.type === 'deposit' ? (
                                <span>External &rarr; {tx.receiverAccount}</span>
                              ) : (
                                <span>{tx.senderAccount} &rarr; Cash</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  tx.status === 'failed' ? 'bg-red-500' :
                                  tx.fraudRiskScore > 0.5 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                                }`} />
                                <span className="font-semibold text-xs text-dark-700 dark:text-dark-300">
                                  {tx.status === 'failed' ? 'Blocked' : 
                                   tx.fraudRiskScore > 0.5 ? `Risk (${(tx.fraudRiskScore*100).toFixed(0)}%)` : 'Clear'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-dark-400">
                              {new Date(tx.timestamp).toLocaleString()}
                            </td>
                            <td className={`px-6 py-4 text-right font-bold text-dark-800 dark:text-dark-100`}>
                              ${tx.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: System Analytics */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6">
                {/* Stats Summary Row */}
                <div className="grid sm:grid-cols-4 gap-4">
                  <div className="glass-card text-center p-5">
                    <span className="text-xs uppercase font-bold text-dark-500 tracking-wider">Total Customers</span>
                    <h2 className="text-3xl font-extrabold mt-1 text-dark-800 dark:text-white">{analytics.totalUsers}</h2>
                  </div>
                  <div className="glass-card text-center p-5">
                    <span className="text-xs uppercase font-bold text-dark-500 tracking-wider">Active Bank Accounts</span>
                    <h2 className="text-3xl font-extrabold mt-1 text-dark-800 dark:text-white">{analytics.totalAccounts}</h2>
                  </div>
                  <div className="glass-card text-center p-5">
                    <span className="text-xs uppercase font-bold text-dark-500 tracking-wider">Deposited Reserves</span>
                    <h2 className="text-3xl font-extrabold mt-1 text-brand-600 dark:text-brand-400">${analytics.totalDeposited.toLocaleString()}</h2>
                  </div>
                  <div className="glass-card text-center p-5">
                    <span className="text-xs uppercase font-bold text-dark-500 tracking-wider">Flagged Fraud Attempts</span>
                    <h2 className="text-3xl font-extrabold mt-1 text-red-500">{analytics.fraudTrxCount}</h2>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Graph: Transaction Volumes */}
                  <div className="glass-card">
                    <h3 className="font-bold text-dark-800 dark:text-white text-base mb-4">Total Transaction Volumes ($)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.transactionStats}>
                          <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Total Volume']} />
                          <Bar dataKey="totalAmount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Graph: Transaction Type distribution */}
                  <div className="glass-card">
                    <h3 className="font-bold text-dark-800 dark:text-white text-base mb-4">Transaction Count Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.transactionStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            dataKey="count"
                            nameKey="_id"
                          >
                            {analytics.transactionStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Transactions']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* REMARKS / DECISION MODAL FOR APPROVING/REJECTING ACCOUNT */}
      {showRemarksModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-dark-200 dark:border-dark-800 overflow-hidden transform transition-all duration-300">
            <div className="px-6 py-4 border-b border-dark-200/50 dark:border-dark-800/50 flex justify-between items-center">
              <h3 className="font-bold text-dark-800 dark:text-white capitalize">
                Confirm Account Request: {actionType}
              </h3>
              <button 
                onClick={() => setShowRemarksModal(false)}
                className="p-1 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-850"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div className="text-xs text-dark-500 leading-relaxed">
                Applicant: <strong>{selectedRequest.userId?.fullName}</strong> <br />
                Account Type: <strong>{selectedRequest.accountType}</strong> <br />
                Initial Deposit: <strong>${selectedRequest.initialDeposit.toFixed(2)}</strong>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-dark-500 block">Remarks / Comments</label>
                <textarea
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="e.g. Identity verified, account created, or deposit limit unmet."
                  className="glass-input h-24 resize-none py-2.5"
                  required={actionType === 'rejected'}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg ${
                  actionType === 'approved' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                    : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                }`}
              >
                <span>Confirm decision</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
