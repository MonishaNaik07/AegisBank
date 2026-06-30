import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actionStart, actionFailure, transferSuccess } from '../redux/slices/accountSlice.js';
import api from '../services/api.js';
import { 
  Send, 
  ShieldAlert, 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ArrowRightLeft,
  Info
} from 'lucide-react';

const Transfer = () => {
  const dispatch = useDispatch();
  const { accounts, loading } = useSelector((state) => state.account);

  const [formData, setFormData] = useState({
    senderAccountNumber: '',
    receiverAccountNumber: '',
    amount: '',
    remarks: '',
  });

  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  
  // AI Warning states
  const [aiWarning, setAiWarning] = useState(null);

  useEffect(() => {
    if (accounts.length > 0 && !formData.senderAccountNumber) {
      setFormData(prev => ({
        ...prev,
        senderAccountNumber: accounts.filter(a => a.status === 'active')[0]?.accountNumber || ''
      }));
    }
  }, [accounts]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
    setAiWarning(null);
  };

  const handleValidate = () => {
    if (!formData.senderAccountNumber) return 'Please select a source account';
    if (!formData.receiverAccountNumber || formData.receiverAccountNumber.length !== 10) {
      return 'Recipient account number must be exactly 10 digits';
    }
    if (formData.senderAccountNumber === formData.receiverAccountNumber) {
      return 'Source and recipient accounts cannot be the same';
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      return 'Please enter a valid amount greater than 0';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setAiWarning(null);

    const error = handleValidate();
    if (error) {
      setFormError(error);
      return;
    }

    dispatch(actionStart());
    try {
      const response = await api.post('/transactions/transfer', {
        ...formData,
        amount: Number(formData.amount),
      });

      if (response.data.otpRequired) {
          setShowOTP(true);
          setSuccessMsg(response.data.message);
          return;
      }

      if (response.data.success) {
        dispatch(transferSuccess({
          senderAccount: response.data.senderAccount,
          transaction: response.data.transaction,
        }));
        
        setSuccessMsg(`Successfully transferred $${Number(formData.amount).toFixed(2)} to account ${formData.receiverAccountNumber}.`);
        setFormData({
          senderAccountNumber: accounts.filter(a => a.status === 'active')[0]?.accountNumber || '',
          receiverAccountNumber: '',
          amount: '',
          remarks: '',
        });
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (err.response?.status === 403 && errorData?.riskScore !== undefined) {
        // AI Fraud Block
        setAiWarning({
          riskScore: errorData.riskScore,
          reasons: errorData.reasons || ['Suspicious activity signature flagged.'],
          amount: formData.amount,
          recipient: formData.receiverAccountNumber
        });
        dispatch(actionFailure('Transaction blocked by security layer'));
      } else {
        setFormError(errorData?.message || 'Transfer failed. Please check connection and account numbers.');
        dispatch(actionFailure(errorData?.message || 'Transfer failed'));
      }
    }
  };

  const verifyOTP = async () => {
      try {
          const response = await api.post(
              "/transactions/verify-otp",
              {
                  otp
              }
          );
          setShowOTP(false);
          setOtp("");
          setSuccessMsg(response.data.message);
      }
      catch(err){
          setFormError(
              err.response?.data?.message ||
              "OTP Verification Failed"
          );
      }
  };

  const activeAccounts = accounts.filter(a => a.status === 'active');

  return (

<>

{showOTP && (

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

<div className="bg-white dark:bg-dark-900 p-8 rounded-2xl w-[400px]">

<h2 className="text-xl font-bold mb-4">

OTP Verification

</h2>

<p className="text-sm mb-5">

An OTP has been sent to your registered email.

</p>

<input

type="text"

placeholder="Enter OTP"

value={otp}

onChange={(e)=>setOtp(e.target.value)}

className="glass-input"

/>

<button

onClick={verifyOTP}

className="mt-5 w-full bg-brand-500 text-white py-3 rounded-xl"

>

Verify OTP

</button>

</div>

</div>

)}

<div></div>
    
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-dark-900 dark:text-white">Transfer Funds</h1>
        <p className="text-sm text-dark-500">Send money to any AegisBank client instantly. Real-time AI watches for irregularities.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card border border-white/20 dark:border-dark-800/80 p-8 glow-brand">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error Alert */}
              {formError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex gap-3 items-start animate-shake">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Source Account Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Source Account</label>
                <select
                  name="senderAccountNumber"
                  value={formData.senderAccountNumber}
                  onChange={handleChange}
                  className="glass-input font-medium"
                >
                  {activeAccounts.length === 0 ? (
                    <option value="">No Active Bank Accounts Available</option>
                  ) : (
                    activeAccounts.map(a => (
                      <option key={a._id} value={a.accountNumber}>
                        {a.accountType} ({a.accountNumber}) - Bal: ${a.balance.toFixed(2)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Recipient Account Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Recipient Account Number (10 Digits)</label>
                <input
                  type="text"
                  name="receiverAccountNumber"
                  value={formData.receiverAccountNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1002349581"
                  maxLength={10}
                  className="glass-input font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Transfer Amount ($)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="1"
                    step="any"
                    className="glass-input font-bold"
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Remarks / Reference</label>
                  <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="e.g. Rent Payment"
                    className="glass-input"
                  />
                </div>
              </div>

              {/* Security Shield Info */}
              <div className="flex gap-2.5 items-start p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl text-xs text-dark-500">
                <BrainCircuit className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                <span>Security Notice: This transfer will scan your historic spending stability, account age, hour signatures, and frequency alerts to verify safety.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || activeAccounts.length === 0}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Security and Transferring...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Funds</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: AI Warning Panel or Helpful Hints */}
        <div className="lg:col-span-5 space-y-6">
          {aiWarning ? (
            <div className="glass-card bg-red-500/5 dark:bg-red-950/20 border-red-500/30 p-6 rounded-2xl relative overflow-hidden animate-pulse border glow-brand shadow-red-500/5">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
                <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                <h3 className="font-extrabold text-lg">AI Security Block Alert!</h3>
              </div>

              <p className="text-xs text-dark-600 dark:text-dark-300 leading-relaxed mb-4">
                AegisBank's Machine Learning detection subservice classified this transfer as highly suspicious. To protect your funds, the transaction has been blocked.
              </p>

              <div className="bg-red-500/10 rounded-xl p-4 text-center mb-4">
                <div className="text-3xl font-black text-red-600 dark:text-red-400">{(aiWarning.riskScore * 100).toFixed(0)}%</div>
                <div className="text-[10px] uppercase font-bold text-red-500 tracking-wider mt-0.5">Fraud Probability Score</div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Identified Risk Factors:</span>
                <ul className="space-y-1.5">
                  {aiWarning.reasons.map((r, i) => (
                    <li key={i} className="text-xs flex gap-2 items-start text-dark-700 dark:text-dark-300">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-brand-600 dark:text-brand-400 border-b border-dark-200/50 dark:border-dark-800/50 pb-3">
                <ArrowRightLeft className="w-5 h-5" />
                <h3 className="font-bold">Transfer Rules & Tips</h3>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed text-dark-500">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <p><strong>Aegis-Verify</strong> analyzes transfer behavior. If a transfer looks abnormal (e.g. transfers over 80% balance, or high sizes at night), it calculates a high fraud probability score.</p>
                </div>
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <p><strong>Limits:</strong> Standard accounts can transfer up to their total balance. However, individual transfers exceeding $100k or transfers from brand new accounts are blocked for manual fraud prevention audits.</p>
                </div>
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <p><strong>Internal Accounts:</strong> Transfer destination must be a valid 10-digit account number registered in the AegisBank database.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

</>

);
};

export default Transfer;
