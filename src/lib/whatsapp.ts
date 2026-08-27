/**
 * Centralized WhatsApp Communication Utility for Chafique Property Agency
 * Agency WhatsApp Number: +250788348201
 */

export const AGENCY_WHATSAPP_NUMBER = '+250788348201';
export const AGENCY_PHONE_CLEAN = '250788348201';

/**
 * Clean phone number into international standard numeric format
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Generate a WhatsApp chat URL for a specific property
 */
export const getPropertyWhatsAppUrl = (
  propertyTitle: string,
  propertyRef?: string,
  priceText?: string,
  customNumber: string = AGENCY_PHONE_CLEAN
): string => {
  const cleanNumber = cleanPhoneNumber(customNumber) || AGENCY_PHONE_CLEAN;
  let message = `Hello Chafique Property Agency, I am interested in "${propertyTitle}"`;
  
  if (propertyRef) {
    message += ` (Ref: #${propertyRef.toUpperCase()})`;
  }
  if (priceText) {
    message += ` listed at ${priceText}`;
  }
  message += `. Please share more details and schedule a private viewing.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate a WhatsApp chat URL for a general agency inquiry or viewing request
 */
export const getGeneralWhatsAppUrl = (
  customMessage?: string,
  customNumber: string = AGENCY_PHONE_CLEAN
): string => {
  const cleanNumber = cleanPhoneNumber(customNumber) || AGENCY_PHONE_CLEAN;
  const message =
    customMessage ||
    `Hello Chafique Property Agency, I am looking for properties for sale/rent in Kigali, Rwanda. How can you assist me?`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate a WhatsApp chat URL for viewing appointment confirmation (Admin to Client)
 */
export const getViewingConfirmationWhatsAppUrl = (
  clientPhone: string,
  clientName: string,
  propertyTitle: string,
  date: string,
  timeSlot: string,
  tourType: string = 'in-person'
): string => {
  const cleanNumber = cleanPhoneNumber(clientPhone);
  const message = `Hello ${clientName}, Chafique Property Agency confirms your ${tourType === 'in-person' ? 'in-person viewing' : 'virtual walkthrough'} for "${propertyTitle}" scheduled on ${date} at ${timeSlot}. Our senior broker will guide you.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

/**
 * Directly open WhatsApp in a new tab or app window
 */
export const openWhatsApp = (url: string): void => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
