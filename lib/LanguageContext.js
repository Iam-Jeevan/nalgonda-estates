'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TRANSLATIONS } from './properties';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app:lang');
      if (saved && ['en', 'te', 'hi'].includes(saved)) setLang(saved);
    } catch (e) {}
  }, []);

  const changeLang = (l) => {
    setLang(l);
    try {
      localStorage.setItem('app:lang', l);
    } catch (e) {}
  };

  const t = (key) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  // Localize property fields like title/description/village/colony
  const tField = (obj, base) => {
    if (!obj) return '';
    if (typeof obj === 'object' && (obj.en || obj.te || obj.hi)) {
      return obj[lang] || obj.en || '';
    }
    if (base) {
      if (lang === 'te' && obj[base + 'Te']) return obj[base + 'Te'];
      if (lang === 'hi' && obj[base + 'Hi']) return obj[base + 'Hi'];
      return obj[base] || '';
    }
    return String(obj);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t, tField }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}