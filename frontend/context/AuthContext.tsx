"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { readStoredValue, removeStoredValue, STORAGE_KEYS } from "@/lib/storageKeys";

export interface User {
  id?: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
  address_detail?: string | null;
  province_code?: string | null;
  province_name?: string | null;
  ward_code?: string | null;
  ward_name?: string | null;
  must_change_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthReady: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Initialize from local storage on mount (simulating persisted session)
  useEffect(() => {
    const storedUser = readStoredValue(STORAGE_KEYS.authUser);
    const storedToken = readStoredValue(STORAGE_KEYS.authToken);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }

    if (storedToken) {
      setToken(storedToken);
    }

    setIsAuthReady(true);
  }, []);

  const login = (userData: User, authToken?: string) => {
    // Generate an avatar if not provided
    const userWithAvatar = {
      ...userData,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userData.name)}`
    };
    setUser(userWithAvatar);
    localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(userWithAvatar));

    if (authToken) {
      setToken(authToken);
      localStorage.setItem(STORAGE_KEYS.authToken, authToken);
    }

    setIsAuthReady(true);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeStoredValue(STORAGE_KEYS.authUser);
    removeStoredValue(STORAGE_KEYS.authToken);
    setIsAuthReady(true);
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...data };
      localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthReady, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
