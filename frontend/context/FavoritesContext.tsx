"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types/product";
import { useAuth } from "@/context/AuthContext";
import { readStoredValue, STORAGE_KEYS } from "@/lib/storageKeys";

interface FavoritesContextType {
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
const GUEST_STORAGE_KEY = STORAGE_KEYS.guestFavorites;

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);

  useEffect(() => {
    if (token) {
      const controller = new AbortController();

      async function loadFavorites() {
        try {
          const response = await fetch("/api/favorites", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          if (!response.ok) {
            setFavorites([]);
            return;
          }

          const data = await response.json();
          setFavorites(data);
        } catch (error) {
          if (!controller.signal.aborted) {
            console.error("Failed to load favorites", error);
            setFavorites([]);
          }
        }
      }

      loadFavorites();

      return () => controller.abort();
    }

    const stored = readStoredValue(GUEST_STORAGE_KEY);

    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse favorites", e);
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [token]);

  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const nextFavorites = exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];

      if (!token) {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(nextFavorites));
      }

      return nextFavorites;
    });

    if (!token) {
      return;
    }

    const method = isFavorite(product.id) ? "DELETE" : "POST";

    fetch(`/api/favorites/${product.id}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (!response.ok) {
        setFavorites((current) => {
          const exists = current.some((p) => p.id === product.id);
          return exists
            ? current.filter((p) => p.id !== product.id)
            : [...current, product];
        });
      }
    }).catch((error) => {
      console.error("Failed to update favorites", error);
      setFavorites((current) => {
        const exists = current.some((p) => p.id === product.id);
        return exists
          ? current.filter((p) => p.id !== product.id)
          : [...current, product];
      });
    });
  };

  const isFavorite = (productId: number) => {
    return favorites.some((p) => p.id === productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
