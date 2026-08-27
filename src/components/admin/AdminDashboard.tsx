import React from 'react';
import {
  Building2,
  DollarSign,
  MessageSquare,
  Calendar,
  TrendingUp,
  PlusCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle,
  Clock,
  Home
} from 'lucide-react';
import { Property, Inquiry, Reservation, SiteSettings } from '../../types';
import { formatPrice } from '../../lib/seo';
import { AdminTab } from './AdminLayout';
import { seedInitialData } from '../../services/propertyService';

interface AdminDashboardProps {
  properties: Property[];
  inquiries: Inquiry[];
  reservations: Reservation[];
  settings: SiteSettings;
  onNavigateTab: (tab: AdminTab) => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  properties,
  inquiries,
  reservations,
  settings,
  onNavigateTab,
  onRefreshData,
}) => {
  // Metrics calculation
  const totalListings = properties.length;
  const forSaleCount = properties.filter((p) => p.status === 'for-sale').length;
  const forRentCount = properties.filter((p) => p.status === 'for-rent').length;
  const totalPortfolioValue = properties.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const newInquiries = inquiries.filter((i) => i.status === 'new').length;
  const pendingReservations = reservations.filter((r) => r.status === 'pending').length;

  const handleReSeed = async () => {
    if (confirm('Re-seed initial luxury properties and sample client data? Any custom items will be restored to default portfolio.')) {
      await seedInitialData();
      onRefreshData();
      alert('Portfolio successfully initialized with verified sample data!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Portfolio Intelligence & Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time management for listings, client dossiers, and private viewing schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReSeed}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset database to seed dataset"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => onNavigateTab('new-property')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Property</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Portfolio Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Portfolio Value</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatPrice(totalPortfolioValue, 'USD', settings.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500">
            Across {totalListings} active luxury listings
          </p>
        </div>

        {/* Metric 2: Active Listings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Listings</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {totalListings}
          </div>
          <p className="text-[11px] text-slate-500">
            {forSaleCount} For Sale • {forRentCount} For Rent
          </p>
        </div>

        {/* Metric 3: Client Inquiries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Client Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-2">
            {inquiries.length}
            {newInquiries > 0 && (
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                {newInquiries} new
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Direct buyer interest submissions
          </p>
        </div>

        {/* Metric 4: Viewing Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Viewing Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-2">
            {reservations.length}
            {pendingReservations > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                {pendingReservations} pending
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Private in-person & video tours
          </p>
        </div>
      </div>

      {/* Two Column Layout: Recent Inquiries & Recent Viewing Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Inquiries</h3>
            </div>
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {inquiries.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No client inquiries yet.</p>
            ) : (
              inquiries.slice(0, 4).map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => onNavigateTab('inquiries')}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{inq.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inq.status === 'new'
                        ? 'bg-amber-100 text-amber-700'
                        : inq.status === 'responded'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{inq.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{inq.email} • {inq.phone}</span>
                    <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Viewing Bookings Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Upcoming Viewing Tours</h3>
            </div>
            <button
              onClick={() => onNavigateTab('reservations')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Bookings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {reservations.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No viewing reservations booked yet.</p>
            ) : (
              reservations.slice(0, 4).map((res) => (
                <div
                  key={res.id}
                  onClick={() => onNavigateTab('reservations')}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{res.clientName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      res.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : res.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate">{res.propertyTitle}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-600" />
                      {res.date} at {res.timeSlot} ({res.tourType})
                    </span>
                    <span>{res.clientPhone}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
