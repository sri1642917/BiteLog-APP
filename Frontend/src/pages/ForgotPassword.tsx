import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Sprout, AlertCircle, CheckCircle2, Shield, Eye, EyeOff, Search } from 'lucide-react';
import { authService } from '../services/authService';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fetchingQuestion, setFetchingQuestion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Step 1: Fetch user's registered security question
  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError('Please enter your registered email or username.');
      return;
    }

    setFetchingQuestion(true);
    try {
      const question = await authService.getSecurityQuestion(username.trim());
      setSecurityQuestion(question);
    } catch (err: any) {
      setError(err.message || 'Account not found. Please verify your username.');
    } finally {
      setFetchingQuestion(false);
    }
  };

  // Step 2: Verify security answer and reset password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!securityAnswer.trim()) {
      setError('Please enter your answer to the security question.');
      return;
    }
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({
        username: username.trim(),
        security_answer: securityAnswer.trim(),
        new_password: newPassword,
      });
      setSuccess(res.message);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your answer.');
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
          onClick={() => navigate('/login')}
          className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Go Back to Login"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Forgot Password?</h2>
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
        <p className="text-xs text-slate-500 font-medium">Verify your identity to reset your password</p>
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

      {/* Stage 1: Lookup Username / Email */}
      {!securityQuestion ? (
        <form onSubmit={handleFindAccount} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enter your Username or Email Address
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., user@example.com"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Enter the username or email you used when creating your 100% offline BiteLog profile. We will look up your registered security question.
          </p>

          <button
            type="submit"
            disabled={fetchingQuestion}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{fetchingQuestion ? 'Finding Account...' : 'Continue to Security Question'}</span>
          </button>
        </form>
      ) : (
        /* Stage 2: Matching Design 4 Screen 2 */
        <form onSubmit={handleVerifyAndReset} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3.5">
          {/* Question Display */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Your Selected Question:</span>
            <p className="text-xs font-bold text-slate-900 leading-snug">
              {securityQuestion}
            </p>
          </div>

          {/* Your Answer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Answer</label>
            <input
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              placeholder="Enter your answer"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Offline Security Note */}
          <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl space-y-1">
            <p className="text-[11px] text-amber-800 leading-relaxed font-medium flex items-start gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>Because BiteLog is 100% offline, this security answer is the only way to recover your password locally.</span>
            </p>
          </div>

          {/* New Password & Confirm */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-3 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
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

          {/* Verify and Reset Button (Big Green Button) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Verifying & Resetting...' : 'Verify and Reset'}
          </button>

          {/* Option to change username */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setSecurityQuestion(null);
                setSecurityAnswer('');
                setError(null);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline"
            >
              Try a different username/email
            </button>
          </div>
        </form>
      )}

      {/* Back to Log In footer */}
      <div className="text-center pt-2">
        <Link to="/login" className="text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors">
          Back to Log In
        </Link>
      </div>
    </div>
  );
};

