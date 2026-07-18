"use client";

import { translateText, type Language } from "@/lib/i18n";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_STORAGE_KEY = "duc_chinh_language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (storedLanguage === "vi" || storedLanguage === "en") {
      setLanguageState(storedLanguage);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;

    if (isReady) {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.cookie = `duc_chinh_language=${language}; path=/; max-age=31536000; samesite=lax`;
    }
  }, [isReady, language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((currentLanguage) => currentLanguage === "vi" ? "en" : "vi");
  }, []);

  const t = useCallback((text: string) => translateText(text, language), [language]);
  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, t, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
