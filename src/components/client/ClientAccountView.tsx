import React, { useState, useEffect } from 'react';
import { 
  User, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  LogOut, 
  Building2, 
  MapPin, 
  BedDouble, 
  Bath, 
  ExternalLink, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Property, Inquiry, Reservation, SiteSettings } from '../../types';
import { getInquiries } from '../../services/inquiryService';
import { getReservations } from '../../services/reservationService';
import { formatPrice } from '../../lib/seo';
import { getGeneralWhatsAppUrl, openWhatsApp } from '../../lib/whatsapp';
import { UserProfileSettings } from '../profile/UserProfileSettings';

interface ClientAccountViewProps {
  settings: SiteSettings;
  onSelectProperty: (property: Property) => void;
  onExploreProperties: () => void;
}

type AccountTab = 'inquiries' | 'viewings' | 'profile';

export const ClientAccountView: React.FC<ClientAccountViewProps> = ({
  settings,
  onSelectProperty,
  onExploreProperties,
}) => {
  const { user, logout, isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState<AccountTab>('inquiries');
  const [userInquiries, setUserInquiries] = useState<Inquiry[]>([]);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) return;
      setLoadingData(true);
      try {
        const [allInquiries, allReservations] = await Promise.all([
          getInquiries(),
          getReservations(),
        ]);

        const userEmailLower = user.email.toLowerCase().trim();
        const filteredInqs = allInquiries.filter(
          (inq) => inq.email?.toLowerCase().trim() === userEmailLower
        );
        const filteredRes = allReservations.filter(
          (res) => (res.clientEmail || res.userEmail)?.toLowerCase().trim() === userEmailLower
        );

        setUserInquiries(filteredInqs);
        setUserReservations(filteredRes);
      } catch (err) {
        console.error('[ClientAccountView] Failed to load client records:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleWhatsAppFollowup = (propertyTitle?: string, refId?: string) => {
    const text = propertyTitle
      ? `Hello Inzu Chafique Properties Agency, I am following up on my inquiry for "${propertyTitle}" (${user?.email}).`
      : `Hello Inzu Chafique Properties Agency, I am reaching out regarding my client account (${user?.email}).`;
    const url = getGeneralWhatsAppUrl(text, settings.whatsappNumber || '+250788348201');
    openWhatsApp(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            {status.toUpperCase()}
          </span>
        );
      case 'pending':
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            {status === 'new' ? 'SUBMITTED' : 'PENDING APPROVAL'}
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3" />
            {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">
            {status?.toUpperCase() || 'ACTIVE'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      {/* Profile Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shrink-0">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {user?.displayName || user?.name || 'Valued Client'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isAdmin ? 'Administrator' : 'Client Profile'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {user?.email}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Firebase Account
              </span>
              <span>•</span>
              <span>Active in Rwanda</span>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          <button
            onClick={() => handleWhatsAppFollowup()}
            className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Direct WhatsApp</span>
          </button>
          <button
            onClick={logout}
            className="px-4 py-2.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 sm:gap-4 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'inquiries'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Inquiries</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {userInquiries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('viewings')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'viewings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Viewing Requests</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {userReservations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Security</span>
        </button>
      </div>

      {/* Tab: My Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {userInquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Inquiries Submitted Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  When you submit inquiry forms for houses, plots, or commercial spaces in Kigali, your submitted messages and agency replies will appear here.
                </p>
              </div>
              <button
                onClick={onExploreProperties}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Find Properties to Inquire About</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userInquiries.map((inquiry) => (
                <div 
                  key={inquiry.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">
                        {inquiry.propertyTitle || 'General Property Inquiry'}
                      </span>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                      "{inquiry.message}"
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span>Submitted: {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                      {inquiry.phone && <span>Contact Phone: {inquiry.phone}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleWhatsAppFollowup(inquiry.propertyTitle, inquiry.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Agency</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Viewing Requests */}
      {activeTab === 'viewings' && (
        <div className="space-y-4">
          {userReservations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Viewing Bookings Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  You can schedule in-person Kigali property walk-throughs or live guided video calls directly from any property listing page.
                </p>
              </div>
              <button
                onClick={onExploreProperties}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Browse Kigali Properties</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userReservations.map((res) => (
                <div 
                  key={res.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">
                        {res.propertyTitle}
                      </span>
                      {getStatusBadge(res.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <strong>Date & Time:</strong> {res.date} at {res.timeSlot}
                      </div>
                      <div>
                        <strong>Tour Mode:</strong> {res.tourType === 'video-call' ? 'Live Video Tour' : 'In-Person Kigali Walkthrough'}
                      </div>
                    </div>
                    {res.notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                        Notes: "{res.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleWhatsAppFollowup(res.propertyTitle, res.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Confirm via WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Profile & Security */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          <UserProfileSettings
            variant="client"
            title="My Client Profile & Credentials"
            subtitle="Manage your registered name, phone number, and password for accessing saved properties and inquiries."
          />

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Agency Concierge & Support in Kigali
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              For priority assistance, custom property searches, or to list your house, villa, or plot in Kigali on Inzu Chafique Properties Agency, reach out directly to our broker.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-900 block">Kigali Head Office:</span>
                <span className="text-slate-600 leading-relaxed">{settings.address || 'Kicukiro, Kanombe, Kabeza at Gamabe Gas Trading House near Kabeza Modern Market'}, Kigali, Rwanda</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-900 block">Direct Broker Line & WhatsApp:</span>
                <span className="text-emerald-700 font-bold">{settings.whatsappNumber || '+250 788 348 201'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
