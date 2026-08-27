import React, { useEffect } from 'react';
import { Property, SiteSettings } from '../../types';
import { generatePropertySchema, generateOrganizationSchema } from '../../lib/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  property?: Property;
  settings?: SiteSettings;
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  property,
  settings,
  noIndex = false,
}) => {
  const baseTitle = settings?.companyName || 'Chafique Property Agency';
  const fullTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} | Kigali Real Estate & Prime Properties`;
  const metaDesc = description || settings?.metaDescription || 'Explore exceptional verified houses, luxury villas, apartments and commercial investments in Kigali, Rwanda.';
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://chafiqueproperty.com');
  const defaultImage = ogImage || (property?.images[0]?.url) || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80';

  useEffect(() => {
    // 1. Set Title
    document.title = fullTitle;

    // Helper: update or create meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMetaTag('name', 'description', metaDesc);
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMetaTag('name', 'author', baseTitle);

    // 3. Open Graph
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:image', defaultImage);
    setMetaTag('property', 'og:site_name', baseTitle);

    // 4. Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDesc);
    setMetaTag('name', 'twitter:image', defaultImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 6. JSON-LD Structured Data
    const schemaScriptId = 'json-ld-structured-data';
    let scriptElement = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = schemaScriptId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    if (property) {
      scriptElement.textContent = JSON.stringify(generatePropertySchema(property, settings?.siteUrl));
    } else if (settings) {
      scriptElement.textContent = JSON.stringify(generateOrganizationSchema(settings));
    }
  }, [fullTitle, metaDesc, currentUrl, defaultImage, ogType, noIndex, property, settings, baseTitle]);

  return null;
};
