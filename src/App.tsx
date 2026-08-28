import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Property, FilterParams, SiteSettings, Inquiry, Reservation } from './types';
import { subscribeToProperties, getProperties } from './services/propertyService';
import { subscribeToInquiries, getInquiries } from './services/inquiryService';
import { subscribeToReservations, getReservations } from './services/reservationService';
import { getSiteSettings } from './services/settingsService';
import { getGeneralWhatsAppUrl, openWhatsApp } from './lib/whatsapp';

// Layout & Common
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SEOHead } from './components/common/SEOHead';
import { LoadingSplash } from './components/common/LoadingSplash';
import { MessageCircle } from 'lucide-react';

// Public & Client Components
import { HeroSection } from './components/public/HeroSection';
import { PropertyGrid } from './components/public/PropertyGrid';
import { PropertyDetails } from './components/public/PropertyDetails';
import { NeighborhoodSpotlight } from './components/public/NeighborhoodSpotlight';
import { WhyChooseUs } from './components/public/WhyChooseUs';
import { TestimonialsSection } from './components/public/TestimonialsSection';
import { ContactSection } from './components/public/ContactSection';
import { FavoritesView } from './components/public/FavoritesView';
import { ClientAccountView } from './components/client/ClientAccountView';
import { AuthModal, AuthMode } from './components/auth/AuthModal';

// Admin Components
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProperties } from './components/admin/AdminProperties';
import { AdminPropertyForm } from './components/admin/AdminPropertyForm';
import { AdminInquiries } from './components/admin/AdminInquiries';
import { AdminReservations } from './components/admin/AdminReservations';
import { AdminNotifications } from './components/admin/AdminNotifications';
import { AdminSettings } from './components/admin/AdminSettings';

type ViewMode = 'home' | 'properties' | 'property-details' | 'favorites' | 'contact' | 'account' | 'admin';

const MainApp: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterParams>({});
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  // Unified Auth Modal State
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: AuthMode;
  }>({
    isOpen: false,
    mode: 'login',
  });

  // App Data
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  // Guarantee branded loading display on initial open
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashElapsed(true);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Load Initial Settings and Subscribe to Real-Time Data Streams
  useEffect(() => {
    let isMounted = true;

    // 1. Load initial settings
    getSiteSettings()
      .then((s) => {
        if (isMounted) setSettings(s);
      })
      .catch((e) => console.warn('Failed loading site settings:', e));

    // 2. Real-time Properties subscription
    const unsubProperties = subscribeToProperties((propsList) => {
      if (isMounted) {
        setProperties(propsList);
        setLoading(false);
      }
    });

    // 3. Real-time Inquiries subscription
    const unsubInquiries = subscribeToInquiries((inqList) => {
      if (isMounted) setInquiries(inqList);
    });

    // 4. Real-time Reservations subscription
    const unsubReservations = subscribeToReservations((resList) => {
      if (isMounted) setReservations(resList);
    });

    return () => {
      isMounted = false;
      unsubProperties();
      unsubInquiries();
      unsubReservations();
    };
  }, []);

  // Handle URL Deep-Linking and Browser Back/Forward PopState
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      if (path.startsWith('/property/')) {
        const slug = path.replace('/property/', '').replace(/\/$/, '').trim();
        if (slug) {
          const found = properties.find((p) => p.slug === slug || p.id === slug);
          if (found) {
            setSelectedProperty(found);
            setCurrentView('property-details');
            return;
          }
        }
      } else if (path === '/properties') {
        setCurrentView('properties');
        setSelectedProperty(null);
        return;
      } else if (path === '/contact') {
        setCurrentView('contact');
        setSelectedProperty(null);
        return;
      } else if (path === '/favorites') {
        setCurrentView('favorites');
        setSelectedProperty(null);
        return;
      } else if (path === '/account') {
        setCurrentView('account');
        setSelectedProperty(null);
        return;
      } else if (path === '/admin') {
        if (isAdmin) {
          setCurrentView('admin');
        } else {
          setCurrentView('home');
        }
        setSelectedProperty(null);
        return;
      } else if (path === '/' || path === '') {
        setCurrentView('home');
        setSelectedProperty(null);
        return;
      }
    };

    if (properties.length > 0) {
      handleUrlRouting();
    }

    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, [properties, isAdmin]);

  const refreshAllData = async () => {
    try {
      const [propsData, inqsData, resData, settsData] = await Promise.all([
        getProperties(),
        getInquiries(),
        getReservations(),
        getSiteSettings(),
      ]);
      setProperties(propsData);
      setInquiries(inqsData);
      setReservations(resData);
      setSettings(settsData);
    } catch (err) {
      console.error('Error refreshing app data:', err);
    }
  };

  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setAuthModalState({
      isOpen: true,
      mode,
    });
  };

  // Handle Navigation with URL PushState
  const navigateTo = (view: ViewMode | string, data?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'admin') {
      if (isAdmin) {
        window.history.pushState(null, '', '/admin');
        setCurrentView('admin');
        if (data?.tab) setAdminTab(data.tab);
      } else {
        handleOpenAuth('login');
      }
      return;
    }

    if (view === 'account') {
      if (user) {
        window.history.pushState(null, '', '/account');
        setCurrentView('account');
      } else {
        handleOpenAuth('login');
      }
      return;
    }

    if (view === 'property-details' && data) {
      const targetSlug = data.slug || data.id;
      window.history.pushState(null, '', `/property/${targetSlug}`);
      setSelectedProperty(data);
      setCurrentView('property-details');
      return;
    }

    if (view === 'properties') {
      window.history.pushState(null, '', '/properties');
      if (data) {
        setActiveFilters(data);
      } else {
        setActiveFilters({});
      }
      setCurrentView('properties');
      return;
    }

    if (view === 'contact') {
      window.history.pushState(null, '', '/contact');
      setCurrentView('contact');
      setSelectedProperty(null);
      return;
    }

    if (view === 'favorites') {
      window.history.pushState(null, '', '/favorites');
      setCurrentView('favorites');
      setSelectedProperty(null);
      return;
    }

    if (view === 'home') {
      window.history.pushState(null, '', '/');
      setCurrentView('home');
      setSelectedProperty(null);
    }
  };

  const handleHeroSearch = (params: FilterParams) => {
    window.history.pushState(null, '', '/properties');
    setActiveFilters(params);
    setCurrentView('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDistrictSector = (district?: string, sector?: string) => {
    window.history.pushState(null, '', '/properties');
    setActiveFilters({ district, sector });
    setCurrentView('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProperty = (prop: Property) => {
    const targetSlug = prop.slug || prop.id;
    window.history.pushState(null, '', `/property/${targetSlug}`);
    setSelectedProperty(prop);
    setCurrentView('property-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openFloatingWhatsApp = () => {
    const url = getGeneralWhatsAppUrl(
      'Hello Chafique Property Agency, I am reaching out from your website to inquire about properties in Kigali.',
      settings?.whatsappNumber || '+250788348201'
    );
    openWhatsApp(url);
  };

  if (loading || !settings || !minSplashElapsed) {
    return (
      <LoadingSplash
        agencyName={settings?.siteTitle || 'Chafique Property Agency'}
        tagline={settings?.companyTagline || "Kigali's Premier Real Estate Agency"}
      />
    );
  }

  // --- ADMIN PORTAL VIEW ---
  if (currentView === 'admin' && isAdmin) {
    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => {
          setAdminTab(tab);
          if (tab === 'new-property') {
            setEditingProperty(null);
          }
        }}
        onExitAdmin={() => navigateTo('home')}
        settings={settings}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            properties={properties}
            inquiries={inquiries}
            reservations={reservations}
            settings={settings}
            onNavigateTab={(tab) => {
              setAdminTab(tab);
              if (tab === 'new-property') setEditingProperty(null);
            }}
            onRefreshData={refreshAllData}
          />
        )}

        {adminTab === 'properties' && (
          <AdminProperties
            properties={properties}
            settings={settings}
            onEditProperty={(prop) => {
              setEditingProperty(prop);
              setAdminTab('new-property');
            }}
            onAddNew={() => {
              setEditingProperty(null);
              setAdminTab('new-property');
            }}
            onViewProperty={(prop) => {
              setSelectedProperty(prop);
              setCurrentView('property-details');
            }}
            onRefresh={refreshAllData}
          />
        )}

        {adminTab === 'new-property' && (
          <AdminPropertyForm
            property={editingProperty}
            onSave={() => {
              refreshAllData();
              setAdminTab('properties');
              setEditingProperty(null);
            }}
            onCancel={() => {
              setAdminTab('properties');
              setEditingProperty(null);
            }}
          />
        )}

        {adminTab === 'inquiries' && (
          <AdminInquiries
            inquiries={inquiries}
            settings={settings}
            onRefresh={refreshAllData}
          />
        )}

        {adminTab === 'reservations' && (
          <AdminReservations
            reservations={reservations}
            settings={settings}
            onRefresh={refreshAllData}
          />
        )}

        {adminTab === 'notifications' && (
          <AdminNotifications
            onNavigateTab={(tab) => setAdminTab(tab)}
          />
        )}

        {adminTab === 'settings' && (
          <AdminSettings
            settings={settings}
            onUpdate={(updated) => setSettings(updated)}
          />
        )}
      </AdminLayout>
    );
  }

  // --- PUBLIC & CLIENT PORTAL VIEWS ---
  const baseDomain = settings?.siteUrl || 'https://chafiquepropertiesagency.vercel.app';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Dynamic SEO Meta Head */}
      {currentView === 'home' && (
        <SEOHead
          settings={settings}
          breadcrumbs={[{ name: 'Home', url: `${baseDomain}/` }]}
        />
      )}
      {currentView === 'properties' && (
        <SEOHead
          title="Houses & Properties for Sale & Rent in Kigali | Chafique Property Agency"
          description="Browse verified residential and commercial properties for sale and rent across Gasabo, Kicukiro, and Nyarugenge districts in Kigali, Rwanda."
          canonicalUrl={`${baseDomain}/properties`}
          settings={settings}
          breadcrumbs={[
            { name: 'Home', url: `${baseDomain}/` },
            { name: 'Properties in Kigali', url: `${baseDomain}/properties` },
          ]}
        />
      )}
      {currentView === 'contact' && (
        <SEOHead
          title="Contact Us | Chafique Property Agency Kigali"
          description="Get in touch with Chafique Property Agency in Kigali, Rwanda for house viewings, buying, selling, or property investments. Call +250 788 348 201."
          canonicalUrl={`${baseDomain}/contact`}
          settings={settings}
          breadcrumbs={[
            { name: 'Home', url: `${baseDomain}/` },
            { name: 'Contact Us', url: `${baseDomain}/contact` },
          ]}
        />
      )}
      {currentView === 'favorites' && (
        <SEOHead
          title="Saved Properties | Chafique Property Agency"
          settings={settings}
          noIndex={true}
        />
      )}
      {currentView === 'account' && (
        <SEOHead
          title="Client Portal | Chafique Property Agency"
          settings={settings}
          noIndex={true}
        />
      )}

      {/* Unified Authentication Modal (Login / Sign Up / Forgot Password) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onSuccess={(redirectTarget) => {
          if (redirectTarget === 'admin') {
            setCurrentView('admin');
            setAdminTab('dashboard');
          } else {
            setCurrentView('account');
          }
        }}
      />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        settings={settings}
        onOpenAuth={handleOpenAuth}
      />

      {/* View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Hero Section with Search Engine */}
            <HeroSection
              settings={settings}
              onSearch={handleHeroSearch}
              totalListingsCount={properties.length}
            />

            {/* Geographic Enclaves Spotlight */}
            <NeighborhoodSpotlight
              properties={properties}
              onSelectDistrictSector={handleSelectDistrictSector}
            />

            {/* Featured Portfolio Properties Section */}
            <PropertyGrid
              properties={properties.filter((p) => p.featured || true)}
              settings={settings}
              initialFilters={activeFilters}
              onSelectProperty={handleOpenProperty}
              title="Featured Kigali Properties"
              subtitle="Explore verified houses, luxury villas, modern apartments, and titled plots across Kigali"
            />

            {/* The Chafique Standard & Value Pillars */}
            <WhyChooseUs />

            {/* Client Endorsements & Testimonials */}
            <TestimonialsSection />
          </div>
        )}

        {currentView === 'properties' && (
          <div className="animate-in fade-in duration-300 py-4">
            <PropertyGrid
              properties={properties}
              settings={settings}
              initialFilters={activeFilters}
              onSelectProperty={handleOpenProperty}
              title="Kigali Properties Catalog"
              subtitle="Browse all verified residential and commercial listings for sale or rent in Gasabo, Kicukiro, and Nyarugenge"
            />
          </div>
        )}

        {currentView === 'property-details' && selectedProperty && (
          <div className="animate-in fade-in duration-300">
            <PropertyDetails
              property={selectedProperty}
              allProperties={properties}
              settings={settings}
              onBack={() => setCurrentView('properties')}
              onSelectProperty={handleOpenProperty}
            />
          </div>
        )}

        {currentView === 'favorites' && (
          <div className="animate-in fade-in duration-300">
            <FavoritesView
              settings={settings}
              onSelectProperty={handleOpenProperty}
              onNavigateHome={() => setCurrentView('properties')}
            />
          </div>
        )}

        {currentView === 'account' && (
          <div className="animate-in fade-in duration-300">
            <ClientAccountView
              settings={settings}
              onSelectProperty={handleOpenProperty}
              onExploreProperties={() => {
                setActiveFilters({});
                setCurrentView('properties');
              }}
            />
          </div>
        )}

        {currentView === 'contact' && (
          <div className="animate-in fade-in duration-300">
            <ContactSection settings={settings} />
          </div>
        )}
      </main>

      {/* Floating WhatsApp Quick Action Button */}
      <button
        onClick={openFloatingWhatsApp}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer group"
        title="Direct WhatsApp Advisory (+250 788 348 201)"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 group-hover:ml-2 text-xs font-bold">
          WhatsApp (+250 788 348 201)
        </span>
      </button>

      {/* Global Footer */}
      <Footer
        settings={settings}
        onNavigate={navigateTo}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <MainApp />
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;

