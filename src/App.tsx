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

  // Handle Navigation
  const navigateTo = (view: ViewMode | string, data?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'admin') {
      if (isAdmin) {
        setCurrentView('admin');
        if (data?.tab) setAdminTab(data.tab);
      } else {
        handleOpenAuth('login');
      }
      return;
    }

    if (view === 'account') {
      if (user) {
        setCurrentView('account');
      } else {
        handleOpenAuth('login');
      }
      return;
    }

    if (view === 'property-details' && data) {
      setSelectedProperty(data);
      setCurrentView('property-details');
      return;
    }

    if (view === 'properties') {
      if (data) {
        setActiveFilters(data);
      } else {
        setActiveFilters({});
      }
      setCurrentView('properties');
      return;
    }

    if (view === 'home' || view === 'favorites' || view === 'contact') {
      setCurrentView(view as ViewMode);
      setSelectedProperty(null);
    }
  };

  const handleHeroSearch = (params: FilterParams) => {
    setActiveFilters(params);
    setCurrentView('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDistrictSector = (district?: string, sector?: string) => {
    setActiveFilters({ district, sector });
    setCurrentView('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProperty = (prop: Property) => {
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

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Chafique Property Agency loading...
        </p>
      </div>
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
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Global SEO Meta Head */}
      <SEOHead settings={settings} />

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

