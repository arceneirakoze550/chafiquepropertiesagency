import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Clock,
  Video,
  UserCheck,
  CheckCircle,
  XCircle,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  MapPin
} from 'lucide-react';
import { Reservation, ReservationStatus, SiteSettings } from '../../types';
import { updateReservationStatus, deleteReservation } from '../../services/reservationService';

interface AdminReservationsProps {
  reservations: Reservation[];
  settings: SiteSettings;
  onRefresh: () => void;
}

export const AdminReservations: React.FC<AdminReservationsProps> = ({
  reservations,
  settings,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.clientName.toLowerCase().includes(search.toLowerCase()) ||
      res.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
      res.clientPhone.toLowerCase().includes(search.toLowerCase()) ||
      res.propertyTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatus = async (id: string, status: ReservationStatus) => {
    try {
      await updateReservationStatus(id, status);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently delete this viewing booking?')) {
      try {
        await deleteReservation(id);
        onRefresh();
      } catch (err) {
        console.error(err);
        alert('Failed to delete reservation.');
      }
    }
  };

  const openWhatsAppConfirm = (res: Reservation) => {
    const rawNumber = res.clientPhone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${res.clientName}, Chafique Property Agency confirms your property viewing appointment for "${res.propertyTitle}" scheduled on ${res.date} at ${res.timeSlot} (${res.tourType === 'in-person' ? 'On-Site Tour' : 'Virtual Walkthrough'}). Our agent will meet you accordingly.`
    );
    window.open(`https://wa.me/${rawNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Private Viewing Bookings & Tours
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage scheduled buyer walkthroughs, VIP in-person access, and live video tours.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client, email, or property title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
        >
          <option value="all">All Booking Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReservations.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <CalendarIcon className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No Reservations Found</h3>
            <p className="text-xs text-slate-400">Viewing bookings made by public clients will appear here.</p>
          </div>
        ) : (
          filteredReservations.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4 hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">
                      {res.tourType === 'in-person' ? 'Private In-Person Tour' : 'Live Virtual Video Tour'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{res.clientName}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    res.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : res.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : res.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {res.status}
                  </span>
                </div>

                {/* Property & Appointment Schedule */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{res.propertyTitle}</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{res.date}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{res.timeSlot}</strong>
                    </span>
                  </div>
                </div>

                {/* Client Contact Info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${res.clientEmail}`} className="hover:text-indigo-600 truncate">{res.clientEmail}</a>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${res.clientPhone}`} className="hover:text-indigo-600 truncate">{res.clientPhone}</a>
                  </div>
                </div>

                {/* Notes if any */}
                {res.notes && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg">
                    "{res.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openWhatsAppConfirm(res)}
                    className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Send WhatsApp Confirmation"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(res.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center gap-1.5">
                  {res.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleStatus(res.id, 'confirmed')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {res.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => handleStatus(res.id, 'completed')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}

                  {res.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleStatus(res.id, 'cancelled')}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
