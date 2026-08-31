import React from 'react';
import { Shield, Key, Lock, UserCheck, Smartphone, Mail, Database, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfileSettings } from '../profile/UserProfileSettings';
import { SiteSettings } from '../../types';

interface AdminProfileProps {
  settings: SiteSettings;
  onNavigateTab?: (tab: any) => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({ settings, onNavigateTab }) => {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shrink-0">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {user?.displayName || user?.name || 'Chafique Administrator'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {user?.email || 'chafiquentuye@gmail.com'}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Full Database & Listing Permissions
              </span>
              <span>•</span>
              <span>Rwanda Brokerage Master</span>
            </div>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('settings')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <span>Agency Branding Settings</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Profile & Password Update Component */}
      <UserProfileSettings
        variant="admin"
        title="Admin Profile & Security Credentials"
        subtitle="Manage your administrator username, contact phone, and account login password directly in Firebase."
      />
    </div>
  );
};
