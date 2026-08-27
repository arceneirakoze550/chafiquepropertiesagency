import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SiteSettings } from '../../types';
import { createInquiry } from '../../services/inquiryService';
import { SEOHead } from '../common/SEOHead';
import { getGeneralWhatsAppUrl, openWhatsApp } from '../../lib/whatsapp';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState<'buying' | 'selling' | 'investing' | 'renting'>('buying');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !message) {
      alert('Please fill out all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createInquiry({
        name,
        email,
        phone,
        message: `[Interest: ${interest.toUpperCase()}] ${message}`,
        preferredContactMethod: 'whatsapp',
      });
      setIsSuccess(true);
      confetti({ particleCount: 70, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const text = `Hello Chafique Property Agency, my name is ${name || 'Client'}. I am reaching out regarding ${interest} properties in Kigali.`;
    const url = getGeneralWhatsAppUrl(text, settings.whatsappNumber || '+250788348201');
    openWhatsApp(url);
  };

  return (
    <section className="bg-slate-50 min-h-screen py-12">
      <SEOHead
        title="Contact Chafique Property Agency | Kigali Real Estate"
        description={`Contact Chafique Property Agency in Kigali, Rwanda. Call or WhatsApp +250 788 348 201 for houses for sale, rentals, land plots, and property management.`}
        settings={settings}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold">
            Rwanda Real Estate Advisory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact Chafique Property Agency
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Looking to buy a house, rent an apartment, acquire titled land, or list your property in Kigali? Reach our senior brokers today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details & Info Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-md">
              <h3 className="text-lg font-bold text-white">Agency Headquarters</h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Location & Office</strong>
                    <span>{settings.address || 'KG 7 Ave, Kigali Heights & KG 11 Ave'}, {settings.city || 'Kigali'}, {settings.country || 'Rwanda'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Official WhatsApp & Call</strong>
                    <a href={`tel:${settings.phone || '+250788348201'}`} className="hover:text-emerald-300 transition-colors font-bold text-sm">
                      {settings.phone || '+250 788 348 201'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Agency Email</strong>
                    <a href={`mailto:${settings.email || 'chafiquentuye@gmail.com'}`} className="hover:text-emerald-300 transition-colors">
                      {settings.email || 'chafiquentuye@gmail.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Working Hours</strong>
                    <span>Mon - Sat: 7:30 AM – 7:30 PM (CAT / Kigali Time)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp (+250 788 348 201)</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Legal Due Diligence</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                All property listings, land UPIs, and title deeds are verified through Rwanda Land Management and Use Authority (RLMUA) and RDB.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {isSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Inquiry Received Successfully!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Thank you, <strong className="text-slate-900">{name}</strong>. A Chafique Property Agency advisor will reach back to you via phone or WhatsApp shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-lg font-bold text-slate-900">Send an Inquiry or Property Request</h3>

                {/* Primary Objective */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    What is your primary goal?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'buying', label: 'Buy a House' },
                      { id: 'selling', label: 'Sell / List Property' },
                      { id: 'investing', label: 'Buy Land / Plot' },
                      { id: 'renting', label: 'Rent a Home' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setInterest(item.id as any)}
                        className={`py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                          interest === item.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name, Email, Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jean-Paul Habimana"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="client@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+250 788 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Message & Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about the location in Kigali (e.g., Gasabo, Nyarutarama, Kibagabaga, Kicukiro), your budget, or specific property features..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">Direct response via WhatsApp or Phone.</p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Inquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
