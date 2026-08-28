import { jsPDF } from 'jspdf';
import { Property, SiteSettings } from '../types';
import { formatPrice } from './seo';

// Helper to convert logo image to base64 for PDF embedding
async function getLogoBase64(): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = '/logo.png';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
}

/**
 * Fast client-side generation of a single property PDF brochure (< 200ms)
 */
export async function exportPropertyPDF(property: Property, settings: SiteSettings): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  const logoBase64 = await getLogoBase64();

  // Top Accent Bar (Emerald)
  doc.setFillColor(5, 150, 105); // #059669
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Header Background (Dark Slate)
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 6, pageWidth, 32, 'F');

  // Embed Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, 9, 26, 26);
    } catch (e) {
      console.warn('Could not add logo to PDF', e);
    }
  }

  // Header Typography
  const titleX = logoBase64 ? margin + 30 : margin;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings.companyName || 'CHAFIQUE PROPERTY AGENCY', titleX, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(167, 243, 208); // emerald-200
  doc.text(settings.companyTagline || 'Verified Real Estate & Property Brokerage in Kigali, Rwanda', titleX, 23);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFontSize(8);
  doc.text(`WhatsApp: ${settings.whatsappNumber || '+250 788 348 201'}  |  Email: ${settings.email || 'chafiquentuye@gmail.com'}`, titleX, 29);

  // Property Title & Reference Banner
  let currentY = 46;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const splitTitle = doc.splitTextToSize(property.title, contentWidth - 45);
  doc.text(splitTitle, margin, currentY);

  // Ref Badge on Right
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - margin - 40, currentY - 5, 40, 8, 2, 2, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`REF: #${property.id.toUpperCase().slice(0, 10)}`, pageWidth - margin - 38, currentY);

  currentY += splitTitle.length * 6 + 4;

  // Location String
  const district = property.location?.district || property.district || 'Gasabo';
  const sector = property.location?.sector || property.sector || '';
  const city = property.location?.city || property.city || 'Kigali';
  const country = property.location?.country || property.country || 'Rwanda';
  const address = property.location?.address || property.address || `${district}, ${city}, ${country}`;

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Location: ${address}`, margin, currentY);

  currentY += 8;

  // Price & Status Box
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

  const formattedPrice = formatPrice(property.price, property.currency, settings.currencySymbol);
  const isRent = property.listingType === 'rent' || property.status === 'for-rent' || property.status === 'rented';

  doc.setTextColor(4, 120, 87); // emerald-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`PRICE: ${formattedPrice}${isRent ? ' / month' : ''}`, margin + 5, currentY + 10.5);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.text(`Type: ${(property.propertyType || property.type || 'House').toUpperCase()}`, pageWidth - margin - 65, currentY + 7);
  doc.text(`Status: ${(property.status || 'Available').toUpperCase()}`, pageWidth - margin - 65, currentY + 12);

  currentY += 22;

  // Key Specifications Grid
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY, contentWidth, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, currentY, contentWidth, 22, 'S');

  const colW = contentWidth / 4;

  const isLand = property.propertyType === 'land' || property.type === 'land';

  // Spec 1
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.text(isLand ? 'LAND TITLE' : 'BEDROOMS', margin + 4, currentY + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(isLand ? 'Clean UPI' : `${property.bedrooms || 0} Beds`, margin + 4, currentY + 16);

  // Spec 2
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(isLand ? 'ZONING' : 'BATHROOMS', margin + colW + 4, currentY + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(isLand ? 'Residential/R1' : `${property.bathrooms || 0} Baths`, margin + colW + 4, currentY + 16);

  // Spec 3
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('SIZE / AREA', margin + colW * 2 + 4, currentY + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`${property.size || property.areaSqFt || 0} sqm`, margin + colW * 2 + 4, currentY + 16);

  // Spec 4
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('PARKING', margin + colW * 3 + 4, currentY + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`${property.parkingSpaces || 2} Cars`, margin + colW * 3 + 4, currentY + 16);

  currentY += 28;

  // Property Overview / Description Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PROPERTY OVERVIEW & HIGHLIGHTS', margin, currentY);
  currentY += 6;

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const cleanDescription = (property.description || 'Verified property in prime Kigali location.').replace(/\n+/g, ' ');
  const splitDesc = doc.splitTextToSize(cleanDescription, contentWidth);
  const descLinesToDraw = splitDesc.slice(0, 5); // keep concise
  doc.text(descLinesToDraw, margin, currentY);
  currentY += descLinesToDraw.length * 4.5 + 4;

  // Features & Amenities
  const features = property.features || property.amenities || [];
  if (features.length > 0) {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('KEY FEATURES & RWANDA AMENITIES', margin, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    const fColW = contentWidth / 2;
    features.slice(0, 8).forEach((feat, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const fx = margin + col * fColW;
      const fy = currentY + row * 5;
      
      // Draw small bullet
      doc.setFillColor(5, 150, 105);
      doc.circle(fx + 2, fy - 1, 1, 'F');
      doc.text(feat, fx + 6, fy);
    });

    currentY += Math.ceil(Math.min(features.length, 8) / 2) * 5 + 4;
  }

  // Video Tour Info (if available)
  if (property.videoUrl || property.virtualTourUrl) {
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, currentY, contentWidth, 10, 1.5, 1.5, 'FD');

    doc.setTextColor(67, 56, 202);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('VIDEO TOUR & VIRTUAL WALKTHROUGH AVAILABLE', margin + 4, currentY + 6.5);

    currentY += 14;
  }

  // Footer / Broker Contact Box
  const footerY = pageHeight - 38;
  doc.setFillColor(15, 23, 42);
  doc.rect(0, footerY, pageWidth, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SCHEDULE A PRIVATE VIEWING / MAKE AN OFFER', margin, footerY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Official Agency: ${settings.companyName || 'Chafique Property Agency'}`, margin, footerY + 15);
  doc.text(`WhatsApp / Call: ${settings.whatsappNumber || '+250 788 348 201'}  |  Direct Tel: ${settings.phone || '+250 788 348 201'}`, margin, footerY + 20);
  doc.text(`Office Location: ${settings.address || 'Kigali City Center'}, ${settings.city || 'Kigali'}, Rwanda`, margin, footerY + 25);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • Verified Kigali Real Estate Factsheet`, margin, footerY + 31);

  // Save PDF
  const filename = `${property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brochure.pdf`;
  doc.save(filename);
}

/**
 * Fast client-side generation of complete agency inventory report
 */
export async function exportInventoryReportPDF(properties: Property[], settings: SiteSettings): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const logoBase64 = await getLogoBase64();

  // Top Accent Bar (Emerald)
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Header Background (Slate 900)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 5, pageWidth, 26, 'F');

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, 7, 22, 22);
    } catch (e) {
      console.warn('Could not add logo', e);
    }
  }

  const headerTextX = logoBase64 ? margin + 26 : margin;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(settings.companyName || 'CHAFIQUE PROPERTY AGENCY', headerTextX, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(167, 243, 208);
  doc.text('OFFICIAL KIGALI REAL ESTATE INVENTORY & VALUATION REPORT', headerTextX, 20);

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${new Date().toLocaleString()}  |  Total Properties: ${properties.length}`, headerTextX, 26);

  // Summary Metrics Banner
  let currentY = 36;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY, contentWidth, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, currentY, contentWidth, 14, 'S');

  const forSale = properties.filter((p) => p.listingType === 'sale' || p.status === 'available' || p.status === 'for-sale');
  const forRent = properties.filter((p) => p.listingType === 'rent' || p.status === 'for-rent' || p.status === 'rented');
  const totalValuationUSD = properties.reduce((acc, p) => acc + (p.currency === 'USD' ? p.price : p.price / 1350), 0);

  const mColW = contentWidth / 4;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.text('TOTAL ACTIVE LISTINGS', margin + 4, currentY + 5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`${properties.length} Properties`, margin + 4, currentY + 10.5);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('PROPERTIES FOR SALE', margin + mColW + 4, currentY + 5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`${forSale.length} Listings`, margin + mColW + 4, currentY + 10.5);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('PROPERTIES FOR RENT', margin + mColW * 2 + 4, currentY + 5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`${forRent.length} Listings`, margin + mColW * 2 + 4, currentY + 10.5);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('PORTFOLIO VALUATION (EST.)', margin + mColW * 3 + 4, currentY + 5);
  doc.setTextColor(4, 120, 87);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`$${Math.round(totalValuationUSD).toLocaleString()} USD`, margin + mColW * 3 + 4, currentY + 10.5);

  currentY += 19;

  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);

  doc.text('#', margin + 2, currentY + 4.5);
  doc.text('TITLE / DESCRIPTION', margin + 10, currentY + 4.5);
  doc.text('TYPE', margin + 85, currentY + 4.5);
  doc.text('LOCATION (KIGALI)', margin + 115, currentY + 4.5);
  doc.text('SPECS (BED/BATH/AREA)', margin + 165, currentY + 4.5);
  doc.text('PRICE', margin + 215, currentY + 4.5);
  doc.text('STATUS', margin + 250, currentY + 4.5);

  currentY += 7;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  properties.slice(0, 20).forEach((prop, idx) => {
    const rowY = currentY + idx * 6.8;
    if (rowY > pageHeight - 20) return; // Prevent page overflow

    // Alternating row background
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY - 1.5, contentWidth, 6.8, 'F');
    }

    doc.setTextColor(100, 116, 139);
    doc.text(`${idx + 1}`, margin + 2, rowY + 3);

    // Title (truncated)
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    const safeTitle = prop.title.length > 42 ? `${prop.title.substring(0, 40)}...` : prop.title;
    doc.text(safeTitle, margin + 10, rowY + 3);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text((prop.propertyType || prop.type || 'House').toUpperCase(), margin + 85, rowY + 3);

    const dist = prop.location?.district || prop.district || 'Gasabo';
    const sec = prop.location?.sector || prop.sector || '';
    doc.text(`${dist}${sec ? ` • ${sec}` : ''}`, margin + 115, rowY + 3);

    const isL = prop.propertyType === 'land' || prop.type === 'land';
    const specStr = isL ? `${prop.size || 0} sqm plot` : `${prop.bedrooms || 0}B / ${prop.bathrooms || 0}Ba • ${prop.size || 0}sqm`;
    doc.text(specStr, margin + 165, rowY + 3);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87);
    const pPrice = formatPrice(prop.price, prop.currency, settings.currencySymbol);
    doc.text(pPrice, margin + 215, rowY + 3);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text((prop.status || 'Available').toUpperCase(), margin + 250, rowY + 3);
  });

  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(6.5);
  doc.text(`Chafique Property Agency • Official Kigali Real Estate Inventory • WhatsApp: ${settings.whatsappNumber || '+250 788 348 201'} • Email: ${settings.email || 'chafiquentuye@gmail.com'}`, margin, pageHeight - 4);

  const filename = `chafique-agency-inventory-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
