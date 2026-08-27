import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property } from '../types';
import { getProperties } from '../services/propertyService';

interface FavoritesContextType {
  favorites: string[]; // Property IDs
  favoriteProperties: Property[];
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (property: Property) => void;
  favoritesCount: number;
}

const LOCAL_FAVORITES_KEY = 'estatehub_saved_favorites';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to sync favorites to local storage', e);
    }

    // Refresh full property models for favorites view
    getProperties().then((all) => {
      setFavoriteProperties(all.filter((p) => favorites.includes(p.id)));
    });
  }, [favorites]);

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  const toggleFavorite = (property: Property) => {
    setFavorites((prev) => {
      if (prev.includes(property.id)) {
        return prev.filter((id) => id !== property.id);
      } else {
        return [...prev, property.id];
      }
    });
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteProperties,
        isFavorite,
        toggleFavorite,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
