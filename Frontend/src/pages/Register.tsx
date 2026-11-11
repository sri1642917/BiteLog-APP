import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, ShieldCheck, Sprout, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

const SECURITY_QUESTIONS = [
  'Favorite Hero?',
  'Favorite Color?',
  'Favorite Ice Cream?',
  'First Pet\'s Name?',
  'Mother\'s Maiden Name?',
  'Favorite Childhood City?'
];

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [secureOffline, setSecureOffline] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!username.trim()) {
      setError('Please enter an email or username.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!securityQuestion) {
      setError('Please select a password recovery security question.');
      return;
    }
    if (!securityAnswer.trim()) {
      setError('Please provide an answer to your recovery security question.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        full_name: fullName.trim(),
        username: username.trim(),
        password,
        security_question: securityQuestion,
        security_answer: securityAnswer.trim(),
      });
      setSuccess('Account created and 100% encrypted offline! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
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
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Register</h2>
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
        <p className="text-xs text-slate-500 font-medium">Create a secure, 100% offline profile</p>
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

      {/* Registration Card (Matching Design 4 Screen 1) */}
      <form onSubmit={handleRegister} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., Sri Harsha"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* Email Address / Username */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., user@example.com"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* Create Password & Confirm Password (2 Columns) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Create Password</label>
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

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="•••••••••"
                className="w-full pl-3 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Password Recovery Question */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Password Recovery Question</label>
          <select
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-slate-800"
          >
            <option value="">Select a Security Question</option>
            {SECURITY_QUESTIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        {/* Your Answer */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Your Answer</label>
          <input
            type="text"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            placeholder="e.g., Blue, Chocolate, or Batman"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* Privacy & Encryption Checkbox */}
        <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={secureOffline}
            onChange={(e) => setSecureOffline(e.target.checked)}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          <span className="text-[11px] text-slate-600 leading-tight flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Secure my data locally on this device (100% offline & encrypted)
          </span>
        </label>

        {/* Register Now Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? 'Creating Encrypted Profile...' : 'Register Now'}
        </button>
      </form>

      {/* Already have an account footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};
