import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Building2,
  TrendingUp,
  MessageSquare,
  Clock,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Property, Inquiry, Reservation, SiteSettings } from '../../types';
import { exportTimeframeReportPDF, exportPropertyPDF } from '../../lib/pdfExport';
import { formatPrice } from '../../lib/seo';

interface AdminReportingProps {
  properties: Property[];
  inquiries: Inquiry[];
  reservations: Reservation[];
  settings: SiteSettings;
}

type TimeframeType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

export const AdminReporting: React.FC<AdminReportingProps> = ({
  properties,
  inquiries,
  reservations,
  settings,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeType>('monthly');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString()); // YYYY

  // Secondary Filters
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isGenerating, setIsGenerating] = useState(false);

  // Timeframe calculation & Date filtering
  const { filteredProperties, filteredInquiries, filteredReservations, timeframeLabel } = useMemo(() => {
    let label = '';
    let start: Date | null = null;
    let end: Date | null = null;

    const now = new Date();

    if (timeframe === 'daily') {
      const d = selectedDate ? new Date(selectedDate) : now;
      label = `Daily Report: ${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    } else if (timeframe === 'weekly') {
      // Past 7 days ending today or selected date
      const refDate = selectedDate ? new Date(selectedDate) : now;
      end = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 23, 59, 59);
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      label = `Weekly Report: ${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    } else if (timeframe === 'monthly') {
      const [y, m] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
      start = new Date(y, m - 1, 1);
      end = new Date(y, m, 0, 23, 59, 59);
      const monthName = start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      label = `Monthly Report: ${monthName}`;
    } else if (timeframe === 'yearly') {
      const y = parseInt(selectedYear || new Date().getFullYear().toString(), 10);
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31, 23, 59, 59);
      label = `Yearly Report: Annual ${y}`;
    } else {
      label = `Full Inventory & Lifetime Performance Report`;
    }

    // Filter properties
    let pList = properties;

    // Optional date filter if property has createdAt/updatedAt
    if (timeframe !== 'all' && start && end) {
      pList = pList.filter((p) => {
        const itemDate = p.createdAt ? new Date(p.createdAt) : p.updatedAt ? new Date(p.updatedAt) : null;
        if (!itemDate || isNaN(itemDate.getTime())) {
          // If no specific created date, include to avoid empty demo list
          return true;
        }
        return itemDate >= start! && itemDate <= end!;
      });
    }

    // Apply secondary filters
    if (listingTypeFilter !== 'all') {
      pList = pList.filter((p) => (p.listingType || (p.status === 'for-rent' ? 'rent' : 'sale')) === listingTypeFilter);
    }

    if (propertyTypeFilter !== 'all') {
      pList = pList.filter((p) => (p.propertyType || p.type || '').toLowerCase() === propertyTypeFilter.toLowerCase());
    }

    if (districtFilter !== 'all') {
      pList = pList.filter((p) => {
        const dist = (p.location?.district || p.district || '').toLowerCase();
        return dist.includes(districtFilter.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      pList = pList.filter((p) => (p.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    // Filter Inquiries
    let inqList = inquiries;
    if (timeframe !== 'all' && start && end) {
      inqList = inqList.filter((i) => {
        const d = new Date(i.createdAt);
        return !isNaN(d.getTime()) && d >= start! && d <= end!;
      });
    }

    // Filter Reservations
    let resList = reservations;
    if (timeframe !== 'all' && start && end) {
      resList = resList.filter((r) => {
        const d = new Date(r.date || r.createdAt);
        return !isNaN(d.getTime()) && d >= start! && d <= end!;
      });
    }

    return {
      filteredProperties: pList,
      filteredInquiries: inqList,
      filteredReservations: resList,
      timeframeLabel: label,
    };
  }, [
    properties,
    inquiries,
    reservations,
    timeframe,
    selectedDate,
    selectedMonth,
    selectedYear,
    listingTypeFilter,
    propertyTypeFilter,
    districtFilter,
    statusFilter,
  ]);

  // Aggregate Metrics
  const totalValuationUSD = filteredProperties.reduce(
    (acc, p) => acc + (p.currency === 'USD' ? p.price : p.price / 1350),
    0
  );
  const forSaleCount = filteredProperties.filter(
    (p) => p.listingType === 'sale' || p.status === 'available' || p.status === 'for-sale'
  ).length;
  const forRentCount = filteredProperties.filter(
    (p) => p.listingType === 'rent' || p.status === 'for-rent' || p.status === 'rented'
  ).length;
  const averagePrice = filteredProperties.length > 0 ? totalValuationUSD / filteredProperties.length : 0;

  // Handle PDF Export
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const activeFiltersArr: string[] = [];
      if (listingTypeFilter !== 'all') activeFiltersArr.push(`Type: ${listingTypeFilter.toUpperCase()}`);
      if (propertyTypeFilter !== 'all') activeFiltersArr.push(`Category: ${propertyTypeFilter}`);
      if (districtFilter !== 'all') activeFiltersArr.push(`District: ${districtFilter}`);
      if (statusFilter !== 'all') activeFiltersArr.push(`Status: ${statusFilter}`);

      await exportTimeframeReportPDF(
        filteredProperties,
        filteredInquiries,
        filteredReservations,
        settings,
        {
          timeframe,
          timeframeLabel,
          filterSummary: activeFiltersArr.length > 0 ? activeFiltersArr.join(' • ') : 'All Kigali Categories',
        }
      );
    } catch (e) {
      console.error('Error generating PDF report:', e);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredProperties.length === 0) {
      alert('No properties available to export.');
      return;
    }

    const headers = ['Ref ID', 'Title', 'Listing Type', 'Property Type', 'District', 'Sector', 'Bedrooms', 'Bathrooms', 'Size (sqm)', 'Price', 'Currency', 'Status'];
    const rows = filteredProperties.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.listingType || 'sale',
      p.propertyType || p.type || 'house',
      p.location?.district || p.district || 'Gasabo',
      p.location?.sector || p.sector || '',
      p.bedrooms || 0,
      p.bathrooms || 0,
      p.size || p.areaSqFt || 0,
      p.price,
      p.currency || 'USD',
      p.status || 'available',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inzu-chafique-report-${timeframe}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
              Executive Analytics
            </span>
            <span className="text-xs text-slate-400 font-medium">Inzu Chafique Properties Agency</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Official Brokerage Reports Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export official Daily, Weekly, Monthly, and Yearly property valuation and brokerage activity reports with agency branding.
          </p>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            title="Export CSV spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating || filteredProperties.length === 0}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              isGenerating || filteredProperties.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download Official PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Timeframe Selector & Parameter Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Select Report Timeframe & Scope</h2>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            {timeframeLabel}
          </span>
        </div>

        {/* 1. Timeframe Tabs */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-2">Report Interval:</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['daily', 'weekly', 'monthly', 'yearly', 'all'] as TimeframeType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  timeframe === t
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All Time / Full Portfolio' : `${t} Report`}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Specific Date / Month / Year Picker based on timeframe */}
        {timeframe === 'daily' && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-xs font-bold text-slate-700 shrink-0">Select Target Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-emerald-500"
            />
            <span className="text-xs text-slate-500">Generates 24-hour transactions, new listings, and tours booked on this date.</span>
          </div>
        )}

        {timeframe === 'weekly' && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-xs font-bold text-slate-700 shrink-0">Week Ending On:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-emerald-500"
            />
            <span className="text-xs text-slate-500">Calculates 7-day rolling performance and inquiry volume leading up to this date.</span>
          </div>
        )}

        {timeframe === 'monthly' && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-xs font-bold text-slate-700 shrink-0">Select Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-emerald-500"
            />
            <span className="text-xs text-slate-500">Produces official monthly summary covering all portfolio changes and client interactions.</span>
          </div>
        )}

        {timeframe === 'yearly' && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-xs font-bold text-slate-700 shrink-0">Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-emerald-500"
            >
              <option value="2026">2026 (Current Fiscal Year)</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <span className="text-xs text-slate-500">Annual audit factsheet showing comprehensive brokerage volume and inventory growth.</span>
          </div>
        )}

        {/* 3. Granular Filter Controls */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1.5">Listing Mode</label>
            <select
              value={listingTypeFilter}
              onChange={(e) => setListingTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
            >
              <option value="all">All (Sale & Rent)</option>
              <option value="sale">For Sale Only</option>
              <option value="rent">For Rent Only</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1.5">Property Category</label>
            <select
              value={propertyTypeFilter}
              onChange={(e) => setPropertyTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
            >
              <option value="all">All Categories</option>
              <option value="villa">Villas & Mansions</option>
              <option value="house">Residential Houses</option>
              <option value="apartment">Modern Apartments</option>
              <option value="land">Titled Land / Plots</option>
              <option value="commercial">Commercial Buildings</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1.5">Kigali District</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
            >
              <option value="all">All Kigali Districts</option>
              <option value="Gasabo">Gasabo (Nyarutarama, Kibagabaga, Gacuriro)</option>
              <option value="Kicukiro">Kicukiro (Niboye, Rebero, Kanombe)</option>
              <option value="Nyarugenge">Nyarugenge (Kiyovu, City Center)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1.5">Listing Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available / Active</option>
              <option value="for-sale">For Sale</option>
              <option value="for-rent">For Rent</option>
              <option value="pending">Pending Offer</option>
              <option value="sold">Sold / Closed</option>
              <option value="rented">Rented</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Properties */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Matching Listings</span>
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{filteredProperties.length}</div>
          <p className="text-[11px] text-slate-500">{forSaleCount} Sale • {forRentCount} Rent</p>
        </div>

        {/* Total Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Valuation</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ${Math.round(totalValuationUSD).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">Approx. {(totalValuationUSD * 1350).toLocaleString()} RWF</p>
        </div>

        {/* Average Price */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg. Property Price</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ${Math.round(averagePrice).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">Per inventory unit</p>
        </div>

        {/* Inquiries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inquiries Logged</span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{filteredInquiries.length}</div>
          <p className="text-[11px] text-slate-500">In selected interval</p>
        </div>

        {/* Viewing Tours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tours Scheduled</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{filteredReservations.length}</div>
          <p className="text-[11px] text-slate-500">In-person & video tours</p>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Report Dataset Table Preview</h3>
            <p className="text-xs text-slate-500">
              Showing {filteredProperties.length} items formatted for the PDF report.
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate & Download PDF</span>
          </button>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No properties found matching the selected timeframe and filter combination.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Property Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Location (Kigali)</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Factsheet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((prop, idx) => {
                  const dist = prop.location?.district || prop.district || 'Gasabo';
                  const sec = prop.location?.sector || prop.sector || '';
                  const isLand = prop.propertyType === 'land' || prop.type === 'land';

                  return (
                    <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 max-w-xs truncate">{prop.title}</p>
                        <span className="text-[10px] text-slate-400 font-mono">REF: #{prop.id.slice(0, 8)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                          {prop.propertyType || prop.type || 'House'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{dist}{sec ? `, ${sec}` : ''}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {isLand ? (
                          <span>{prop.size || 0} sqm Plot</span>
                        ) : (
                          <span>{prop.bedrooms || 0} Beds • {prop.bathrooms || 0} Baths • {prop.size || 0}m²</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {formatPrice(prop.price, prop.currency, settings.currencySymbol)}
                        {(prop.listingType === 'rent' || prop.status === 'for-rent') && (
                          <span className="text-[10px] font-normal text-slate-400">/mo</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {prop.status || 'Available'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => exportPropertyPDF(prop, settings)}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title="Download individual single-property factsheet PDF"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Developer and Agency Footer Credit */}
      <div className="p-4 bg-slate-900 text-slate-400 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Inzu Chafique Properties Agency • Official Certified Kigali Brokerage Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Developed by:</span>
          <span className="text-emerald-400 font-bold">Arcene IRAKOZE</span>
          <span className="text-slate-600">•</span>
          <span>arceneirakoze550@gmail.com</span>
          <span className="text-slate-600">•</span>
          <span>0796599461</span>
        </div>
      </div>
    </div>
  );
};
