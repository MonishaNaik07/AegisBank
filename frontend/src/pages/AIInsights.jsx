import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actionStart, actionFailure, fetchInsightsSuccess } from '../redux/slices/accountSlice.js';
import api from '../services/api.js';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { 
  BrainCircuit, 
  Zap, 
  AlertCircle, 
  Target,
  Loader2
} from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b', '#10b981'];

const AIInsights = () => {
  const dispatch = useDispatch();
  const { insights, loading, error, accounts } = useSelector((state) => state.account);

  // Budget parameters form state
  const [income, setIncome] = useState(5000);
  const [savingsGoal, setSavingsGoal] = useState(1000);
  const [submittedIncome, setSubmittedIncome] = useState(5000);
  const [submittedGoal, setSubmittedGoal] = useState(1000);

  const loadInsights = async (incVal = income, goalVal = savingsGoal) => {
    dispatch(actionStart());
    try {
      const response = await api.get(`/ai/insights?income=${incVal}&savingsGoal=${goalVal}`);
      dispatch(fetchInsightsSuccess(response.data.data));
      setSubmittedIncome(incVal);
      setSubmittedGoal(goalVal);
    } catch (err) {
      dispatch(actionFailure(err.response?.data?.message || 'Failed to fetch AI insights'));
    }
  };

  useEffect(() => {
    loadInsights(income, savingsGoal);
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (income <= 0 || savingsGoal <= 0) return;
    loadInsights(income, savingsGoal);
  };

  if (loading && !insights) {
    return (
      <div className="h-96 flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <span className="text-sm text-dark-500">Querying financial analytics models...</span>
      </div>
    );
  }

  const { spendingAnalysis, budgetRecommendations } = insights || {};

  // Map spending categories to Recharts structure
  const chartData = spendingAnalysis?.categories?.map((c) => ({
    name: c.category,
    value: c.amount,
  })) || [];

  // Map 50/30/20 budgets to Recharts structure
  const budgetChartData = budgetRecommendations?.suggested_budgets?.map((b) => ({
    name: b.category,
    limit: b.limit,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-dark-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-brand-500" />
            <span>AI Insights & Analytics</span>
          </h1>
          <p className="text-sm text-dark-500">AI-powered spending analysis, budgeting insights, and personalized financial recommendations.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Spending Analytics */}
        <div className="lg:col-span-8 space-y-6">

          {/* Spending Patterns Card */}
          <div className="glass-card">
            <h3 className="font-bold text-dark-800 dark:text-white text-lg mb-2">Category Spending Distribution</h3>
            <p className="text-xs text-dark-500 mb-4">Breakdown of outgoing ledger entries parsed by AI semantic categorization.</p>
            
            {chartData.length === 0 ? (
              <div className="h-60 flex flex-col justify-center items-center text-dark-400 italic text-sm">
                No outbound transaction data available for analysis.
              </div>
            ) : (
              <div className="grid md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Spent']} 
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Labels and values list */}
                <div className="md:col-span-5 space-y-3">
                  <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider block border-b border-dark-200/50 dark:border-dark-800/50 pb-2">Category Breakdown</span>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {spendingAnalysis?.categories?.map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="font-semibold text-dark-600 dark:text-dark-300 truncate max-w-[120px]">{cat.category}</span>
                        </div>
                        <div className="font-bold">
                          ${cat.amount.toFixed(0)} <span className="text-[10px] text-dark-400 font-normal">({cat.percentage.toFixed(0)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recommendations, Budgets, and Form inputs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Income details Form */}
          <div className="glass-card space-y-4">
            <h3 className="font-bold text-dark-800 dark:text-white text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-500" />
              <span>Budget Objectives</span>
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-dark-400 tracking-wider">Est. Monthly Income ($)</label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  min="1"
                  className="glass-input text-xs py-2 px-3"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-dark-400 tracking-wider">Savings Goal Target ($)</label>
                <input
                  type="number"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(Number(e.target.value))}
                  min="1"
                  className="glass-input text-xs py-2 px-3"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <span>Recalculate AI Budgets</span>
              </button>
            </form>
          </div>

          {/* Spending Anomalies Card */}
          {spendingAnalysis?.anomalies?.length > 0 && (
            <div className="glass-card bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 p-5 rounded-2xl space-y-3 shadow-amber-500/5">
              <div className="flex gap-2 items-center text-amber-600 dark:text-amber-400 font-bold">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <h4 className="text-sm">Alerts & Anomalies</h4>
              </div>
              <div className="space-y-2">
                {spendingAnalysis.anomalies.map((anom, idx) => (
                  <p key={idx} className="text-xs text-dark-600 dark:text-dark-300 leading-relaxed">
                    {anom}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* AI Custom Budget Guidelines */}
          <div className="glass-card space-y-4">
            <h3 className="font-bold text-dark-800 dark:text-white text-base">50/30/20 Target Budgets</h3>
            
            {budgetChartData.length === 0 ? (
              <p className="text-xs text-dark-400 italic">Configure budget goals above to visualize details.</p>
            ) : (
              <div className="space-y-3">
                {budgetRecommendations?.suggested_budgets?.map((b, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-dark-600 dark:text-dark-300">
                      <span>{b.category} ({b.percentage}%)</span>
                      <span>Max limit: ${b.limit.toFixed(0)}</span>
                    </div>
                    {/* Progress Bar indicating target sizes */}
                    <div className="w-full h-2 bg-dark-200 dark:bg-dark-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          idx === 0 ? 'bg-brand-500' : idx === 1 ? 'bg-indigo-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${b.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="border-t border-dark-200/50 dark:border-dark-800/50 pt-3.5 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-dark-400 tracking-wider block">AI Advice & Suggestions:</span>
                  {budgetRecommendations?.recommendations?.map((rec, i) => (
                    <div key={i} className="flex gap-2 items-start text-xs text-dark-600 dark:text-dark-300 leading-relaxed">
                      <Zap className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
