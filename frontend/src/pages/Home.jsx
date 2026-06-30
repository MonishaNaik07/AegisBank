import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BrainCircuit, Bot, LineChart, Sparkles, ArrowRight, CheckCircle, CreditCard } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle.jsx';

const Home = () => {
  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 text-dark-900 dark:text-dark-100 transition-colors duration-300">
      {/* Navigation */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between border-b border-dark-200/40 dark:border-dark-800/40 sticky top-0 bg-dark-50/80 dark:bg-dark-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="bg-brand-500 text-white p-2 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-brand-600 dark:text-brand-500">
            AegisBank
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-dark-600 hover:text-dark-900 dark:text-dark-300 dark:hover:text-dark-50 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20 transition-all"
          >
            Open Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Financial Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-dark-950 dark:text-white">
            Secure Banking, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-indigo-600 dark:from-brand-400 dark:to-indigo-400">
              Enhanced by Machine Learning
            </span>
          </h1>

          <p className="text-base sm:text-lg text-dark-600 dark:text-dark-400 max-w-xl">
            Protect your wealth and manage your accounts with AegisBank. Every transfer is analyzed by our automated fraud classifier, keeping your assets secure 24/7.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 flex items-center gap-2 group transition-all duration-200"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl font-bold border border-dark-300 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-900 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Visual Graphic Mockup */}
        <div className="lg:col-span-5 relative">
          {/* Decorative gradients */}
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />

          {/* Core visual panel */}
          <div className="relative glass-card border border-white/20 dark:border-dark-800/80 p-8 glow-brand space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-dark-400 uppercase tracking-widest font-semibold">Security Shield Active</p>
                <h3 className="font-bold text-lg mt-0.5">Real-Time Risk Analysis</h3>
              </div>
              <span className="p-2 rounded-xl bg-success-50 dark:bg-success-500/10 text-success-500 border border-success-500/20 text-xs font-semibold">
                99.8% Safe
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm items-center pb-2 border-b border-dark-200/50 dark:border-dark-800/50">
                <span className="text-dark-500">Transaction ID</span>
                <span className="font-mono font-medium text-xs">TXN94321A8X</span>
              </div>
              <div className="flex justify-between text-sm items-center pb-2 border-b border-dark-200/50 dark:border-dark-800/50">
                <span className="text-dark-500">Transfer Amount</span>
                <span className="font-bold">$12,450.00</span>
              </div>
              <div className="flex justify-between text-sm items-center pb-2 border-b border-dark-200/50 dark:border-dark-800/50">
                <span className="text-dark-500">ML Classification</span>
                <span className="text-success-500 font-semibold">Genuine</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-dark-500">Fraud Probability</span>
                <span className="font-bold text-success-500">1.24%</span>
              </div>
            </div>

            <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 flex gap-3 items-start">
              <BrainCircuit className="w-5 h-5 text-brand-500 mt-0.5" />
              <div className="text-xs text-brand-800 dark:text-brand-300 leading-relaxed">
                AegisBank Random Forest models evaluated this transfer in 14ms and verified it complies with your typical spending profile.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-dark-200/30 dark:border-dark-800/30">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold text-dark-950 dark:text-white">Smart Security and Deep Insights</h2>
          <p className="text-dark-600 dark:text-dark-400">
            AegisBank leverages dedicated Python machine learning APIs to provide state-of-the-art protections and financial utilities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card hover:translate-y-[-4px]">
            <div className="p-3 rounded-xl bg-brand-500 text-white w-fit mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">ML Fraud Detection</h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">
              Every funds transfer runs through a Random Forest Classifier trained to screen irregular sizes, times, and activities.
            </p>
          </div>

          <div className="glass-card hover:translate-y-[-4px]">
            <div className="p-3 rounded-xl bg-indigo-500 text-white w-fit mb-4">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Spending Trends</h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">
              Visual analytics plot category spend distributions and alert you of unusual expenses using scikit-learn.
            </p>
          </div>

          <div className="glass-card hover:translate-y-[-4px]">
            <div className="p-3 rounded-xl bg-purple-500 text-white w-fit mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">AI Financial Bot</h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">
              Chat with our automated assistant that responds contextually using account balances and ledgers.
            </p>
          </div>

          <div className="glass-card hover:translate-y-[-4px]">
            <div className="p-3 rounded-xl bg-emerald-500 text-white w-fit mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Credit Scoring</h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">
              Real-time credit score assessments evaluate stability indicators, active accounts, and payment history.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-brand-900/5 dark:bg-brand-950/20 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-dark-950 dark:text-white">Built for Maximum Safety</h2>
            <p className="text-dark-600 dark:text-dark-400 leading-relaxed">
              Our e-banking architecture combines robust frontend states with server security protocols:
            </p>

            <ul className="space-y-3.5">
              {[
                "JWT session verification and token refreshes",
                "Strict role-based authorization (User, Admin, Owner)",
                "Full input validation and API rate limiting",
                "Helmet headers and secure password hashing",
                "MongoDB transactional ledger records"
              ].map((text, idx) => (
                <li key={idx} className="flex gap-3 items-center text-sm">
                  <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 text-center space-y-1">
              <div className="text-3xl font-black text-brand-600 dark:text-brand-400">3</div>
              <div className="text-xs uppercase tracking-wider text-dark-500 font-bold">Max Accounts</div>
            </div>
            <div className="glass-card p-6 text-center space-y-1">
              <div className="text-3xl font-black text-brand-600 dark:text-brand-400">$500</div>
              <div className="text-xs uppercase tracking-wider text-dark-500 font-bold">Min Deposit</div>
            </div>
            <div className="glass-card p-6 text-center space-y-1">
              <div className="text-3xl font-black text-brand-600 dark:text-brand-400">14ms</div>
              <div className="text-xs uppercase tracking-wider text-dark-500 font-bold">AI Risk Screening</div>
            </div>
            <div className="glass-card p-6 text-center space-y-1">
              <div className="text-3xl font-black text-brand-600 dark:text-brand-400">100%</div>
              <div className="text-xs uppercase tracking-wider text-dark-500 font-bold">Encrypted Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-dark-500 border-t border-dark-200/30 dark:border-dark-800/30">
        &copy; {new Date().getFullYear()} AegisBank. All rights reserved. Secure ML E-Banking application demonstration.
      </footer>
    </div>
  );
};

export default Home;
