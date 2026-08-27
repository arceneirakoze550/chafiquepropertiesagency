import React, { useState } from 'react';
import { Shield, Lock, Mail, Key, X, AlertCircle, Sparkles, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isFirebaseConfigured } from '../../lib/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login, quickAdminLogin, error, clearError } = useAuth();
  const [email, setEmail] = useState('admin@estatehub-properties.com');
  const [password, setPassword] = useState('AdminEstate2026!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    quickAdminLogin();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Chafique Property Agency Portal</h3>
              <p className="text-xs text-slate-400">Authenticated Management Access</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@estatehub-properties.com"
                  value={email}
                  onChange={(e) => {
                    clearError();
                    setEmail(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    clearError();
                    setPassword(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In with Credentials'}
            </button>
          </form>

          {/* Quick Demo Admin Button */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Instant Principal Broker Login (1-Click)</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Allows instant exploration of Admin Dashboard, Property Editor & Inquiries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
