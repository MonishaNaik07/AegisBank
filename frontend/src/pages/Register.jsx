import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure, clearError } from '../redux/slices/authSlice.js';
import api from '../services/api.js';
import { CreditCard, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { loading, error, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearError());
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
    if (!formData.fullName) errors.fullName = 'Full name is required';
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email format is invalid';
    }
    
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.zipCode) errors.zipCode = 'Zip code is required';
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidate()) return;

    dispatch(authStart());
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        dispatch(authSuccess({
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        }));
        navigate('/dashboard');
      } else {
        dispatch(authFailure(response.data.message || 'Registration failed'));
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

      <div className="w-full max-w-lg space-y-6">
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
          <h2 className="text-xl font-bold text-dark-800 dark:text-white pt-2">Create your AegisBank account</h2>
        </div>

        {/* Card Form */}
        <div className="glass-card glow-brand border border-white/20 dark:border-dark-800/80 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Global Error Banner */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex gap-2.5 items-start">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`glass-input ${fieldErrors.fullName ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {fieldErrors.fullName && (
                  <p className="text-xs text-red-500 font-medium">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className={`glass-input ${fieldErrors.username ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {fieldErrors.username && (
                  <p className="text-xs text-red-500 font-medium">{fieldErrors.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={`glass-input ${fieldErrors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={`glass-input ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 font-medium">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, Springfield"
                className={`glass-input ${fieldErrors.address ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {fieldErrors.address && (
                <p className="text-xs text-red-500 font-medium">{fieldErrors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Zip Code */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="12345"
                  className={`glass-input ${fieldErrors.zipCode ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {fieldErrors.zipCode && (
                  <p className="text-xs text-red-500 font-medium">{fieldErrors.zipCode}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className={`glass-input pr-12 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:text-dark-500 dark:hover:text-dark-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-500 font-medium">{fieldErrors.password}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="text-center text-sm text-dark-500 mt-6 pt-6 border-t border-dark-200/50 dark:border-dark-800/50">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
