import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  MessageCircle,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  ExternalLink,
  ChevronDown,
  X
} from 'lucide-react';
import { Inquiry, InquiryStatus, SiteSettings } from '../../types';
import { updateInquiryStatus, deleteInquiry, updateInquiryNotes } from '../../services/inquiryService';

interface AdminInquiriesProps {
  inquiries: Inquiry[];
  settings: SiteSettings;
  onRefresh: () => void;
}

export const AdminInquiries: React.FC<AdminInquiriesProps> = ({
  inquiries,
  settings,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [internalNotes, setInternalNotes] = useState('');

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(search.toLowerCase()) ||
      inq.email.toLowerCase().includes(search.toLowerCase()) ||
      inq.phone.toLowerCase().includes(search.toLowerCase()) ||
      (inq.propertyTitle && inq.propertyTitle.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectInquiry = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setInternalNotes(inq.notes || '');
  };

  const handleStatusChange = async (inqId: string, status: InquiryStatus) => {
    try {
      await updateInquiryStatus(inqId, status);
      if (selectedInquiry?.id === inqId) {
        setSelectedInquiry((prev) => prev ? { ...prev, status } : null);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      await updateInquiryNotes(selectedInquiry.id, internalNotes);
      setSelectedInquiry((prev) => prev ? { ...prev, notes: internalNotes } : null);
      onRefresh();
      alert('Internal notes updated.');
    } catch (err) {
      console.error(err);
      alert('Failed to save notes.');
    }
  };

  const handleDelete = async (inqId: string) => {
    if (confirm('Permanently delete this client inquiry?')) {
      try {
        await deleteInquiry(inqId);
        if (selectedInquiry?.id === inqId) {
          setSelectedInquiry(null);
        }
        onRefresh();
      } catch (err) {
        console.error(err);
        alert('Failed to delete inquiry.');
      }
    }
  };

  const openWhatsApp = (phone: string, name: string, propertyTitle?: string) => {
    const rawNumber = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${name}, thank you for contacting Chafique Property Agency regarding ${propertyTitle ? `"${propertyTitle}"` : 'our Kigali properties'}. How may I assist you?`
    );
    window.open(`https://wa.me/${rawNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Client Inquiries & CRM Leads
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct acquisition requests, off-market requests, and buyer communications.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, or property..."
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
          <option value="all">All Inquiry Statuses</option>
          <option value="new">New (Unreviewed)</option>
          <option value="in-progress">In Progress</option>
          <option value="responded">Responded</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Inquiries Grid & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col max-h-[700px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Inquiry Queue ({filteredInquiries.length})</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredInquiries.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No inquiries found.</p>
            ) : (
              filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => handleSelectInquiry(inq)}
                  className={`p-4 transition-colors cursor-pointer space-y-1.5 ${
                    selectedInquiry?.id === inq.id
                      ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                      : inq.status === 'new'
                      ? 'bg-white font-medium hover:bg-slate-50'
                      : 'bg-white hover:bg-slate-50 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{inq.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      inq.status === 'new'
                        ? 'bg-amber-100 text-amber-800'
                        : inq.status === 'responded'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {inq.status}
                    </span>
                  </div>

                  {inq.propertyTitle && (
                    <p className="text-[11px] text-indigo-600 font-semibold truncate">
                      Re: {inq.propertyTitle}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {inq.message}
                  </p>

                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>{inq.email}</span>
                    <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Inquiry Detailed Dossier */}
        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
              {/* Header & Status Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    Lead Ref ID: #{selectedInquiry.id.toUpperCase()}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    {selectedInquiry.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as InquiryStatus)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  >
                    <option value="new">Status: New</option>
                    <option value="in-progress">Status: In Progress</option>
                    <option value="responded">Status: Responded</option>
                    <option value="archived">Status: Archived</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Property Target if specified */}
              {selectedInquiry.propertyTitle && (
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold block">Inquired Residence</span>
                    <strong className="text-xs font-bold text-indigo-950">{selectedInquiry.propertyTitle}</strong>
                  </div>
                  {selectedInquiry.propertyPrice && (
                    <span className="text-xs font-bold text-indigo-900">
                      ${selectedInquiry.propertyPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Client Contact Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Email</span>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-xs font-semibold text-slate-900 hover:text-indigo-600 truncate block"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Phone Number</span>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="text-xs font-semibold text-slate-900 hover:text-indigo-600 truncate block"
                  >
                    {selectedInquiry.phone}
                  </a>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Preferred Channel</span>
                  <span className="text-xs font-semibold text-slate-900 uppercase">
                    {selectedInquiry.preferredContactMethod || 'Email'}
                  </span>
                </div>
              </div>

              {/* Full Message Body */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Client Inquiry Message
                </label>
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-800 leading-relaxed whitespace-pre-line border border-slate-100">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Internal Broker Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Internal Broker Notes & Dossier Progress
                </label>
                <textarea
                  rows={3}
                  placeholder="Record private notes, budget approvals, legal counsel contacts, or follow-up milestones..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Save Internal Notes
                </button>
              </div>

              {/* Fast Reply Triggers */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openWhatsApp(selectedInquiry.phone, selectedInquiry.name, selectedInquiry.propertyTitle)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply via WhatsApp</span>
                </button>

                <a
                  href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(`Chafique Property Agency: ${selectedInquiry.propertyTitle || 'Property Inquiry'}`)}`}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">No Inquiry Selected</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Select an inquiry from the queue on the left to review client requests and dispatch follow-ups.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
