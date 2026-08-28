import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

export type AuthMode = 'login' | 'signup' | 'forgot-password';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess: (redirectTarget: 'admin' | 'account') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const { login, signUp, forgotPassword, error, clearError } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientValidationMsg, setClientValidationMsg] = useState<string | null>(null);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setClientValidationMsg(null);
      setResetSentSuccess(false);
      clearError();
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSwitchMode = (newMode: AuthMode) => {
    clearError();
    setClientValidationMsg(null);
    setResetSentSuccess(false);
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setClientValidationMsg(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setClientValidationMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setClientValidationMsg('Please enter your full name.');
        return;
      }
      if (!password || password.length < 6) {
        setClientValidationMsg('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setClientValidationMsg('Passwords do not match.');
        return;
      }
    }

    if (mode === 'login' && !password) {
      setClientValidationMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const userProfile = await login(cleanEmail, password);
        onClose();
        if (userProfile.role === 'admin') {
          onSuccess('admin');
        } else {
          onSuccess('account');
        }
      } else if (mode === 'signup') {
        const userProfile = await signUp(fullName.trim(), cleanEmail, password);
        onClose();
        onSuccess('account');
      } else if (mode === 'forgot-password') {
        await forgotPassword(cleanEmail);
        setResetSentSuccess(true);
      }
    } catch (err) {
      console.error('[AuthModal] Action failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <BrandLogo
              size="md"
              variant="white-card"
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {mode === 'login' && 'Sign In to Chafique Property'}
                {mode === 'signup' && 'Create Client Account'}
                {mode === 'forgot-password' && 'Reset Your Password'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'login' && 'Access saved properties, inquiries & appointments'}
                {mode === 'signup' && 'Join to schedule tours & save Kigali listings'}
                {mode === 'forgot-password' && 'Enter your email to receive recovery instructions'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Error Banner */}
          {(clientValidationMsg || error) && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium leading-relaxed">
                {clientValidationMsg || error}
              </div>
            </div>
          )}

          {/* Reset Sent Success Notice */}
          {resetSentSuccess && mode === 'forgot-password' ? (
            <div className="space-y-4 py-2 text-center animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Password Reset Email Sent</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  We have dispatched password recovery instructions to <strong className="text-slate-900">{email}</strong>. Please check your inbox and spam folder.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name for Sign Up */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jean-Claude Habimana"
                      value={fullName}
                      onChange={(e) => {
                        setClientValidationMsg(null);
                        setFullName(e.target.value);
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => {
                      clearError();
                      setClientValidationMsg(null);
                      setEmail(e.target.value);
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== 'forgot-password' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('forgot-password')}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                      value={password}
                      onChange={(e) => {
                        clearError();
                        setClientValidationMsg(null);
                        setPassword(e.target.value);
                      }}
                      className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password for Sign Up */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setClientValidationMsg(null);
                        setConfirmPassword(e.target.value);
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {mode === 'login' && 'Signing in...'}
                      {mode === 'signup' && 'Creating account...'}
                      {mode === 'forgot-password' && 'Sending reset link...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot-password' && 'Send Password Reset Email'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Mode Switchers */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            {mode === 'login' && (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signup')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Create client account
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}

            {mode === 'forgot-password' && !resetSentSuccess && (
              <p>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Return to sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
