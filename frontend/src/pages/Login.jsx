import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure, clearError } from '../redux/slices/authSlice.js';
import api from '../services/api.js';
import { CreditCard, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle.jsx';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { loading, error, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear errors when entering
    dispatch(clearError());
    
    // Redirect if already logged in
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleValidate = () => {
    const errors = {};
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidate()) return;

    dispatch(authStart());
    try {
      const response = await api.post('/auth/login', formData);
      if (response.data.success) {
        dispatch(authSuccess({
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        }));
        navigate('/dashboard');
      } else {
        dispatch(authFailure(response.data.message || 'Login failed'));
      }
    } catch (err) {
      dispatch(authFailure(
        err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Server connection failed'
      ));
    }
  };

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex flex-col justify-center items-center p-6 transition-colors duration-300 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-brand-500 text-white p-2.5 rounded-2xl">
              <CreditCard className="w-7 h-7" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-brand-600 dark:text-brand-500">
              AegisBank
            </span>
          </Link>
          <h2 className="text-xl font-bold text-dark-800 dark:text-white pt-2">Sign in to your account</h2>
        </div>

        {/* Card Form */}
        <div className="glass-card glow-brand border border-white/20 dark:border-dark-800/80 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Global Error Banner */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex gap-2.5 items-start">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className={`glass-input ${fieldErrors.username ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {fieldErrors.username && (
                <p className="text-xs text-red-500 font-medium">{fieldErrors.username}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`glass-input pr-12 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:text-dark-500 dark:hover:text-dark-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="text-center text-sm text-dark-500 mt-6 pt-6 border-t border-dark-200/50 dark:border-dark-800/50">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:underline font-semibold">
              Open an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
