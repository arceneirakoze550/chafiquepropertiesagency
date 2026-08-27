import React, { useState } from 'react';
import { Send, X, CheckCircle2, MessageSquare, User, Mail, Phone, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Property, SiteSettings } from '../../types';
import { createInquiry } from '../../services/inquiryService';

interface InquiryModalProps {
  property?: Property;
  settings: SiteSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  property,
  settings,
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'email' | 'phone' | 'whatsapp'>('whatsapp');
  const [message, setMessage] = useState(
    property
      ? `Hello, I would like to receive more details, floor plans, and investment disclosures for "${property.title}" (Ref: ${property.id}).`
      : 'Hello, I would like to consult with a Chafique Property Agency specialist regarding purchasing/investing in your Kigali portfolio.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !message) {
      alert('Please fill all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createInquiry({
        propertyId: property?.id,
        propertyTitle: property?.title,
        propertySlug: property?.slug,
        propertyImage: property?.images[0]?.url,
        name,
        email,
        phone,
        message,
        preferredContactMethod,
      });

      setIsSuccess(true);
      confetti({ particleCount: 70, spread: 50 });
    } catch (err) {
      console.error('Inquiry submission error:', err);
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsAppDirect = () => {
    const rawNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello Chafique Property Agency, my name is ${name || 'Client'}. ${message}`
    );
    window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank');
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {property ? 'Inquire About Property' : 'Direct Concierge Inquiry'}
              </h3>
              <p className="text-xs text-slate-500">
                {property ? property.title : 'Direct line to our senior real estate advisors'}
              </p>
            </div>
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
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Inquiry Received Successfully</h4>
            <p className="text-xs text-slate-600">
              Thank you, {name}. A dedicated property advisor will review your request and get in touch promptly via {preferredContactMethod}.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={openWhatsAppDirect}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" /> Continue on WhatsApp
              </button>
              <button
                onClick={resetAndClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Eleanor Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Preferred Contact Method */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Preferred Contact Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(['whatsapp', 'email', 'phone'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPreferredContactMethod(method)}
                    className={`py-1.5 px-2 text-xs rounded-md border text-center font-medium capitalize transition-all cursor-pointer ${
                      preferredContactMethod === method
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Message / Inquiries</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={openWhatsAppDirect}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" /> Quick WhatsApp
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
