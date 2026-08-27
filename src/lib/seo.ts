import { Property, SiteSettings } from '../types';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  property?: Property;
  settings?: SiteSettings;
  noIndex?: boolean;
}

export const generatePropertySchema = (property: Property, siteUrl: string = 'https://chafique-property-agency.com') => {
  const coverImage = property.images?.find((img) => img.isCover)?.url || property.images?.[0]?.url || '';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    'name': property.title,
    'description': property.description,
    'url': `${siteUrl}/property/${property.slug}`,
    'image': property.images?.map((img) => img.url) || [],
    'datePosted': property.createdAt,
    'offers': {
      '@type': 'Offer',
      'price': property.price,
      'priceCurrency': property.currency || 'USD',
      'availability': property.status === 'available' || property.status === 'for-sale' || property.status === 'for-rent' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/SoldOut',
      'businessFunction': (property.listingType === 'rent' || property.status === 'for-rent' || property.status === 'rented') 
        ? 'https://schema.org/LeaseOut' 
        : 'https://schema.org/SellAction'
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': property.location?.address || property.address || '',
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
    'numberOfBedrooms': property.bedrooms || 0,
    'numberOfBathroomsTotal': property.bathrooms || 0,
    'floorSize': {
      '@type': 'QuantitativeValue',
      'value': property.size || property.areaSqFt || 0,
      'unitCode': 'MTK'
    },
    'amenityFeature': (property.amenities || property.features || []).map((f) => ({
      '@type': 'LocationFeatureSpecification',
      'name': f,
      'value': true
    }))
  };
};

export const generateOrganizationSchema = (settings: SiteSettings) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    'name': settings?.companyName || 'Chafique Property Agency',
    'description': settings?.companyTagline || 'Prime Real Estate Agency in Kigali, Rwanda',
    'url': settings?.siteUrl || 'https://chafique-property-agency.com',
    'telephone': settings?.phone || '+250788348201',
    'email': settings?.email || 'chafiquentuye@gmail.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': settings?.address || 'KG 7 Ave, Kigali Heights',
      'addressLocality': settings?.city || 'Kigali',
      'addressCountry': 'Rwanda'
    }
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

export const generateSitemapXml = (properties: Property[], baseUrl: string = 'https://chafique-property-agency.com'): string => {
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
    loc: `${baseUrl}/property/${p.slug}`,
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
