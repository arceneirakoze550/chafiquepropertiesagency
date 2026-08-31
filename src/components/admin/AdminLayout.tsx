import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  MessageSquare,
  Calendar,
  Bell,
  Settings,
  LogOut,
  ArrowLeft,
  Shield,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationAsRead } from '../../services/notificationService';
import { AppNotification, SiteSettings } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

export type AdminTab = 'dashboard' | 'properties' | 'new-property' | 'reports' | 'inquiries' | 'reservations' | 'notifications' | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  settings: SiteSettings;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  settings,
  children,
}) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    getNotifications().then(setNotifications);
    const interval = setInterval(() => {
      getNotifications().then(setNotifications);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif: AppNotification) => {
    await markNotificationAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setShowNotificationDropdown(false);
    if (notif.link?.includes('inquiries')) {
      onSelectTab('inquiries');
    } else if (notif.link?.includes('reservations')) {
      onSelectTab('reservations');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'Property Listings', icon: Building },
    { id: 'new-property', label: 'Add New Property', icon: PlusCircle },
    { id: 'reports', label: 'Reports & PDF Export', icon: FileText },
    { id: 'inquiries', label: 'Client Inquiries', icon: MessageSquare },
    { id: 'reservations', label: 'Viewing Bookings', icon: Calendar },
    { id: 'notifications', label: 'Notification Logs', icon: Bell, badge: unreadCount },
    { id: 'settings', label: 'Agency Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800">
          <BrandLogo
            size="sm"
            showText={true}
            textColor="light"
            subtitle="Agency Admin Portal"
            variant="white-card"
          />
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Return to Website */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/60 rounded-xl text-slate-300">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
              {user?.displayName?.charAt(0) || 'C'}
            </div>
            <div className="truncate flex-1">
              <p className="font-semibold text-white truncate text-[11px]">{user?.displayName || 'Chafique Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'chafiquentuye@gmail.com'}</p>
            </div>
          </div>

          <button
            onClick={onExitAdmin}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Website</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 text-slate-300"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-bold">Inzu Chafique Admin</span>
        </div>
        <button
          onClick={onExitAdmin}
          className="text-xs text-emerald-300 flex items-center gap-1 font-medium"
        >
          <span>Exit</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden bg-slate-900 text-white p-4 space-y-1 border-b border-slate-800 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id as AdminTab);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                  currentTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar for desktop with Firebase status & Notification dropdown */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {navItems.find((n) => n.id === currentTab)?.label || 'Admin Portal'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                    <span>Recent Notifications ({unreadCount} new)</span>
                    <button
                      onClick={() => onSelectTab('notifications')}
                      className="text-emerald-600 hover:underline font-normal text-[11px]"
                    >
                      View all
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1.5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            notif.read ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50 text-emerald-950 font-medium'
                          }`}
                        >
                          <p className="font-semibold">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 mt-0.5 block">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render View Content */}
        <main className="p-6 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
};
