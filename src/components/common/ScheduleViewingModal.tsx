import React, { useState } from 'react';
import { Calendar, Clock, Video, MapPin, X, CheckCircle2, User, Mail, Phone, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Property } from '../../types';
import { createReservation } from '../../services/reservationService';

interface ScheduleViewingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  '09:30 AM',
  '11:00 AM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM'
];

export const ScheduleViewingModal: React.FC<ScheduleViewingModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [tourType, setTourType] = useState<'in-person' | 'video-call'>('in-person');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !userPhone || !date || !timeSlot) {
      alert('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReservation({
        propertyId: property.id,
        propertyTitle: property.title,
        propertySlug: property.slug,
        propertyImage: property.images[0]?.url,
        propertyLocation: `${property.location.city}, ${property.location.state}`,
        userName,
        userEmail,
        userPhone,
        clientName: userName,
        clientEmail: userEmail,
        clientPhone: userPhone,
        date,
        timeSlot,
        tourType,
        notes,
      });

      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error('Failed to create reservation', err);
      alert('Failed to book tour. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Schedule Private Viewing</h3>
            <p className="text-xs text-slate-500 truncate max-w-sm">{property.title}</p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Tour Confirmed & Reserved!</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you, <strong className="text-slate-900">{userName}</strong>. Your {tourType === 'in-person' ? 'in-person private viewing' : 'live virtual video tour'} for{' '}
              <strong className="text-slate-900">{property.title}</strong> has been booked for{' '}
              <strong className="text-slate-900">{date} at {timeSlot}</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Our concierge agent has received your request and will contact you via {userEmail} and WhatsApp/SMS.
            </p>
            <div className="pt-4">
              <button
                onClick={resetAndClose}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tour Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Viewing Experience
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTourType('in-person')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    tourType === 'in-person'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <MapPin className={`w-5 h-5 ${tourType === 'in-person' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">In-Person Tour</p>
                    <p className="text-[10px] text-slate-500">Private guided walk</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTourType('video-call')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    tourType === 'video-call'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Video className={`w-5 h-5 ${tourType === 'video-call' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Live Video Tour</p>
                    <p className="text-[10px] text-slate-500">Interactive HD stream</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Select Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Time Slot *
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Special Requests or Inquiries (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Questions about financing, HOA fees, or specific property features..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Booking Tour...' : 'Confirm Viewing Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
