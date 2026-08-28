import React, { useEffect } from 'react';
import { Property, SiteSettings } from '../../types';
import {
  DEFAULT_CANONICAL_DOMAIN,
  generatePropertySchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generatePropertySeoTitle,
  generatePropertySeoDescription
} from '../../lib/seo';

interface SEOHeadProps {
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

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  property,
  settings,
  noIndex = false,
  breadcrumbs,
}) => {
  const baseDomain = settings?.siteUrl || DEFAULT_CANONICAL_DOMAIN;
  const baseCompanyName = settings?.companyName || 'Chafique Property Agency';

  // Compute Page Title
  let fullTitle = '';
  if (property) {
    fullTitle = title || generatePropertySeoTitle(property, baseCompanyName);
  } else if (title) {
    fullTitle = title.includes(baseCompanyName) ? title : `${title} | ${baseCompanyName}`;
  } else {
    fullTitle = 'Chafique Property Agency | Houses & Properties in Kigali, Rwanda';
  }

  // Compute Meta Description (Natural 150-160 chars)
  let metaDesc = '';
  if (property) {
    metaDesc = description || generatePropertySeoDescription(property);
  } else if (description) {
    metaDesc = description;
  } else if (settings?.metaDescription) {
    metaDesc = settings.metaDescription;
  } else {
    metaDesc = 'Find verified houses for sale and rent, luxury villas, apartments, and prime investment land across Kigali, Rwanda with Chafique Property Agency.';
  }

  // Canonical URL
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const computedCanonical = canonicalUrl || (property ? `${baseDomain}/property/${property.slug || property.id}` : `${baseDomain}${currentPath === '/' ? '' : currentPath}`);

  // Image for Social Previews
  const defaultImage = ogImage ||
    property?.images?.find((img) => img.isCover)?.url ||
    property?.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80';

  useEffect(() => {
    // 1. Title Tag
    document.title = fullTitle;

    // Helper to safely set/update meta tags
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Core Search Engine Meta Directives
    setMetaTag('name', 'description', metaDesc);
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMetaTag('name', 'googlebot', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMetaTag('name', 'author', baseCompanyName);
    setMetaTag('name', 'geo.region', 'RW');
    setMetaTag('name', 'geo.placename', 'Kigali');
    setMetaTag('name', 'geo.position', '-1.9441;30.1035');
    setMetaTag('name', 'ICBM', '-1.9441, 30.1035');

    // 3. Open Graph Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:type', property ? 'article' : ogType);
    setMetaTag('property', 'og:url', computedCanonical);
    setMetaTag('property', 'og:image', defaultImage);
    setMetaTag('property', 'og:site_name', baseCompanyName);
    setMetaTag('property', 'og:locale', 'en_US');

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDesc);
    setMetaTag('name', 'twitter:image', defaultImage);
    setMetaTag('name', 'twitter:creator', '@ChafiqueAgency');

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', computedCanonical);

    // 6. JSON-LD Structured Data
    // Primary schema (Property or Organization)
    const primarySchemaScriptId = 'json-ld-primary-schema';
    let primaryScript = document.getElementById(primarySchemaScriptId) as HTMLScriptElement | null;
    if (!primaryScript) {
      primaryScript = document.createElement('script');
      primaryScript.id = primarySchemaScriptId;
      primaryScript.type = 'application/ld+json';
      document.head.appendChild(primaryScript);
    }

    if (property) {
      primaryScript.textContent = JSON.stringify(generatePropertySchema(property, baseDomain));
    } else {
      primaryScript.textContent = JSON.stringify(generateOrganizationSchema(settings));
    }

    // Breadcrumbs Schema if provided
    const breadcrumbsScriptId = 'json-ld-breadcrumbs-schema';
    let breadcrumbsScript = document.getElementById(breadcrumbsScriptId) as HTMLScriptElement | null;

    if (breadcrumbs && breadcrumbs.length > 0) {
      if (!breadcrumbsScript) {
        breadcrumbsScript = document.createElement('script');
        breadcrumbsScript.id = breadcrumbsScriptId;
        breadcrumbsScript.type = 'application/ld+json';
        document.head.appendChild(breadcrumbsScript);
      }
      breadcrumbsScript.textContent = JSON.stringify(generateBreadcrumbSchema(breadcrumbs));
    } else if (breadcrumbsScript) {
      breadcrumbsScript.remove();
    }
  }, [
    fullTitle,
    metaDesc,
    computedCanonical,
    defaultImage,
    ogType,
    noIndex,
    property,
    settings,
    baseCompanyName,
    baseDomain,
    breadcrumbs,
  ]);

  return null;
};

