import React, { useState } from 'react';
import { Building2, Heart, Shield, Menu, X, Phone, MessageCircle, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { SiteSettings } from '../../types';
import { FirebaseStatusBanner } from '../common/FirebaseStatusBanner';
import { getGeneralWhatsAppUrl, openWhatsApp } from '../../lib/whatsapp';

interface NavbarProps {
  settings: SiteSettings;
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenAuth: (mode?: 'login' | 'signup' | 'forgot-password') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentView,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string, data?: any) => {
    onNavigate(view, data);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsApp = () => {
    const url = getGeneralWhatsAppUrl(
      'Hello Chafique Property Agency, I would like to inquire about available properties for sale and rent in Kigali.',
      settings.whatsappNumber || '+250788348201'
    );
    openWhatsApp(url);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro bar with Firebase status and Direct Contact */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FirebaseStatusBanner />
          <span className="hidden md:inline text-slate-400 font-medium">
            Kigali, Rwanda • Verified Real Estate Brokerage
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`tel:${settings.phone || '+250788348201'}`}
            className="hidden sm:flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>{settings.phone || '+250788348201'}</span>
          </a>
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp (+250 788 348 201)</span>
          </button>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-600 transition-colors">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors block leading-tight uppercase">
                Chafique
                <span className="text-emerald-700 font-bold ml-1.5">
                  Property Agency
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium block">
                Kigali Real Estate • Rwanda
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('properties', { listingType: 'sale' })}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentView === 'properties'
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              For Sale
            </button>

            <button
              onClick={() => handleNav('properties', { listingType: 'rent' })}
              className="px-3.5 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              For Rent
            </button>

            <button
              onClick={() => handleNav('properties', { propertyType: 'land' })}
              className="px-3.5 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Plots & Land
            </button>

            <button
              onClick={() => handleNav('contact')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentView === 'contact'
                  ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Contact Us
            </button>
          </nav>

          {/* Right actions: Favorites + Auth Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={() => handleNav('favorites')}
              className="relative p-2.5 text-slate-600 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              title="Saved Properties"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <button
                    onClick={() => handleNav('admin')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer ${
                      currentView === 'admin'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-900 text-white hover:bg-emerald-700'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('account')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all border cursor-pointer ${
                      currentView === 'account'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="max-w-[120px] truncate">{user.displayName || user.name || 'Account'}</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleNav('favorites')}
              className="relative p-2 text-slate-600"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute 0 top-0 right-0 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Explore Kigali Properties
            </button>
            <button
              onClick={() => handleNav('properties', { listingType: 'sale' })}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Properties For Sale
            </button>
            <button
              onClick={() => handleNav('properties', { listingType: 'rent' })}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Properties For Rent
            </button>
            <button
              onClick={() => handleNav('properties', { propertyType: 'land' })}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Land & Plots
            </button>
            <button
              onClick={() => handleNav('contact')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Contact & Inquiries
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={handleWhatsApp}
              className="w-full py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp (+250 788 348 201)
            </button>
            
            {user ? (
              <div className="flex flex-col gap-2 pt-1">
                {isAdmin ? (
                  <button
                    onClick={() => handleNav('admin')}
                    className="w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Admin Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('account')}
                    className="w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>My Account ({user.displayName || user.email})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 border border-slate-200 text-rose-600 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-2 cursor-pointer hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2.5 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg text-center cursor-pointer hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-slate-600" />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

