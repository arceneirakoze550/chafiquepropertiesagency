import { Property, SiteSettings } from '../types';

export const DEFAULT_CANONICAL_DOMAIN = 'https://chafiquepropertiesagency.vercel.app';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  property?: Property;
  settings?: SiteSettings | null;
  noIndex?: boolean;
  breadcrumbs?: { name: string; url: string }[];
}

/**
 * Generates dynamic, keyword-rich and natural SEO title for a Kigali property
 */
export const generatePropertySeoTitle = (property: Property, agencyName: string = 'Chafique Property Agency'): string => {
  const typeLabel = property.propertyType
    ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
    : 'Property';
  const isRent = property.listingType === 'rent' || property.status === 'for-rent' || property.status === 'rented';
  const actionLabel = isRent ? 'for Rent' : 'for Sale';
  const district = property.location?.district || property.district || 'Kigali';
  const sector = property.location?.sector || property.sector;
  const locationStr = sector ? `${sector}, ${district}` : `${district}, Kigali`;

  if (property.bedrooms && property.bedrooms > 0) {
    return `${property.bedrooms} Bedroom ${typeLabel} ${actionLabel} in ${locationStr} | ${agencyName}`;
  }
  return `${property.title} | ${agencyName}`;
};

/**
 * Generates dynamic, natural ~150-160 char meta description for a Kigali property
 */
export const generatePropertySeoDescription = (property: Property): string => {
  const isRent = property.listingType === 'rent' || property.status === 'for-rent' || property.status === 'rented';
  const actionLabel = isRent ? 'for rent' : 'for sale';
  const typeLabel = property.propertyType || 'property';
  const district = property.location?.district || property.district || 'Gasabo';
  const sector = property.location?.sector || property.sector;
  const locationStr = sector ? `${sector}, ${district}` : `${district}`;
  const bedroomsStr = property.bedrooms && property.bedrooms > 0 ? `${property.bedrooms} bedrooms, ` : '';
  const bathroomsStr = property.bathrooms && property.bathrooms > 0 ? `${property.bathrooms} bathrooms, ` : '';
  const sizeStr = (property.size || property.areaSqFt) ? `${property.size || property.areaSqFt} sqm, ` : '';
  const priceFormatted = formatPrice(property.price, property.currency);

  const desc = `Verified ${bedroomsStr}${bathroomsStr}${sizeStr}${typeLabel} ${actionLabel} in ${locationStr}, Kigali, Rwanda. Listed at ${priceFormatted}. Book a private viewing with Chafique Property Agency.`;
  return desc.length > 165 ? desc.slice(0, 162) + '...' : desc;
};

/**
 * Generates Schema.org RealEstateListing structured data for properties
 */
export const generatePropertySchema = (property: Property, siteUrl: string = DEFAULT_CANONICAL_DOMAIN) => {
  const baseDomain = siteUrl || DEFAULT_CANONICAL_DOMAIN;
  const propertyUrl = `${baseDomain}/property/${property.slug || property.id}`;
  const images = property.images?.map((img) => img.url) || [];
  const coverImage = property.images?.find((img) => img.isCover)?.url || images[0] || '';
  const isRent = property.listingType === 'rent' || property.status === 'for-rent' || property.status === 'rented';

  const schemaType = property.propertyType === 'apartment' 
    ? 'Apartment' 
    : property.propertyType === 'commercial' 
    ? 'CommercialBuilding' 
    : property.propertyType === 'land' 
    ? 'Landform' 
    : 'SingleFamilyResidence';

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    'name': property.title,
    'description': property.description,
    'url': propertyUrl,
    'image': images.length > 0 ? images : [coverImage],
    'datePosted': property.createdAt || new Date().toISOString(),
    'mainEntity': {
      '@type': schemaType,
      'name': property.title,
      'description': property.description,
      'image': images.length > 0 ? images : [coverImage],
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': property.location?.address || property.address || 'Kigali',
        'addressLocality': property.location?.city || property.city || 'Kigali',
        'addressRegion': property.location?.district || property.district || 'Gasabo',
        'postalCode': '00000',
        'addressCountry': 'RW'
      },
      ...(property.location?.coordinates ? {
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': property.location.coordinates.lat,
          'longitude': property.location.coordinates.lng
        }
      } : {}),
      ...(property.bedrooms && property.bedrooms > 0 ? { 'numberOfBedrooms': property.bedrooms } : {}),
      ...(property.bathrooms && property.bathrooms > 0 ? { 'numberOfBathroomsTotal': property.bathrooms } : {}),
      ...((property.size || property.areaSqFt) ? {
        'floorSize': {
          '@type': 'QuantitativeValue',
          'value': property.size || property.areaSqFt,
          'unitCode': 'MTK'
        }
      } : {}),
      'amenityFeature': (property.amenities || property.features || []).map((f) => ({
        '@type': 'LocationFeatureSpecification',
        'name': f,
        'value': true
      }))
    },
    'offers': {
      '@type': 'Offer',
      'price': property.price,
      'priceCurrency': property.currency || 'USD',
      'priceValidUntil': new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().split('T')[0],
      'availability': property.status === 'available' || property.status === 'for-sale' || property.status === 'for-rent'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      'businessFunction': isRent
        ? 'https://schema.org/LeaseOut'
        : 'https://schema.org/SellAction',
      'seller': {
        '@type': 'RealEstateAgent',
        'name': 'Chafique Property Agency',
        'telephone': '+250788348201',
        'url': baseDomain
      }
    }
  };
};

/**
 * Generates Schema.org BreadcrumbList structured data
 */
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
};

/**
 * Generates Schema.org RealEstateAgent / RealEstateAgency organization structured data
 */
export const generateOrganizationSchema = (settings?: SiteSettings | null) => {
  const baseDomain = settings?.siteUrl || DEFAULT_CANONICAL_DOMAIN;
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgency',
    'name': settings?.companyName || 'Chafique Property Agency',
    'alternateName': ['Chafique Properties', 'Chafique Real Estate Rwanda'],
    'description': settings?.companyTagline || 'Premier Real Estate Agency in Kigali, Rwanda. Verified houses for sale, houses for rent, luxury villas, modern apartments and titled investment plots.',
    'url': baseDomain,
    'logo': `${baseDomain}/favicon.ico`,
    'image': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
    'telephone': settings?.phone || '+250788348201',
    'email': settings?.email || 'chafiquentuye@gmail.com',
    'priceRange': '$$ - $$$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': settings?.address || 'KG 7 Ave, Kigali Heights & KG 11 Ave',
      'addressLocality': settings?.city || 'Kigali',
      'addressRegion': 'Gasabo',
      'postalCode': '00000',
      'addressCountry': 'RW'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': -1.9441,
      'longitude': 30.1035
    },
    'areaServed': [
      { '@type': 'City', 'name': 'Kigali' },
      { '@type': 'AdministrativeArea', 'name': 'Gasabo' },
      { '@type': 'AdministrativeArea', 'name': 'Kicukiro' },
      { '@type': 'AdministrativeArea', 'name': 'Nyarugenge' },
      { '@type': 'Country', 'name': 'Rwanda' }
    ],
    'knowsAbout': [
      'Houses for sale in Kigali',
      'Houses for rent in Kigali',
      'Properties in Kicukiro',
      'Properties in Gasabo',
      'Properties in Nyarutarama',
      'Properties in Kibagabaga',
      'Properties in Gacuriro',
      'Luxury villas Kigali',
      'Real Estate in Rwanda'
    ],
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '08:00',
        'closes': '18:00'
      }
    ],
    'sameAs': [
      settings?.socialLinks?.facebook || 'https://facebook.com',
      settings?.socialLinks?.instagram || 'https://instagram.com',
      settings?.socialLinks?.linkedin || 'https://linkedin.com',
      settings?.socialLinks?.twitter || 'https://twitter.com'
    ].filter(Boolean)
  };
};

export const formatPrice = (price: number, currency: string = 'USD', symbol?: string): string => {
  if (isNaN(price)) return `${currency === 'RWF' ? 'RWF ' : '$'}0`;
  
  if (currency === 'RWF') {
    return `${price.toLocaleString('en-US')} RWF`;
  }
  
  const sym = symbol || (currency === 'USD' ? '$' : `${currency} `);
  return `${sym}${price.toLocaleString('en-US')}`;
};

export const generateSitemapXml = (properties: Property[], baseUrl: string = DEFAULT_CANONICAL_DOMAIN): string => {
  interface SitemapEntry {
    loc: string;
    changefreq: string;
    priority: string;
    lastmod?: string;
  }

  const pages: SitemapEntry[] = [
    { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${baseUrl}/properties`, changefreq: 'daily', priority: '0.9' },
    { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: '0.7' },
  ];

  const propertyUrls: SitemapEntry[] = properties.map((p) => ({
    loc: `${baseUrl}/property/${p.slug || p.id}`,
    lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '0.8'
  }));

  const all: SitemapEntry[] = [...pages, ...propertyUrls];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map((item) => `  <url>
    <loc>${item.loc}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ''}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

