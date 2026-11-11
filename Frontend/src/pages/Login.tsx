import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Sprout, AlertCircle, CheckCircle2, Eye, EyeOff, Shield } from 'lucide-react';
import { authService } from '../services/authService';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter your username or email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(username.trim(), password);
      setSuccess(`Welcome back, ${res.user.full_name}! Redirecting...`);
      setTimeout(() => {
        navigate('/');
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-[420px] mx-auto animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Sign In</h2>
        <div className="w-8"></div>
      </div>

      {/* Brand & Subtitle */}
      <div className="text-center pt-1 pb-1">
        <div className="inline-flex items-center justify-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Sprout className="w-5 h-5 fill-emerald-500/20 stroke-[2.2]" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">BiteLog</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">Welcome back! Log in to your offline profile</p>
      </div>

      {/* Error / Success Feedback */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Login Card */}
      <form onSubmit={handleLogin} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4">
        {/* Username or Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Username or Email</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., user@example.com"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <Link
              to="/forgot-password"
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••"
              className="w-full pl-3 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 100% Offline Notice */}
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Credentials are verified locally using salted cryptographic hashes.</span>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50 mt-1 cursor-pointer"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Don't have an account footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

