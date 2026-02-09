'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionaries, Locale, getDictionary } from '@/i18n/dictionaries';

type LanguageContextType = {
    language: Locale;
    setLanguage: (lang: Locale) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Locale>('en');

    useEffect(() => {
        // Check if window is defined to ensure we are on the client
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('language') as Locale;
            if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
                setLanguage(savedLanguage);
            }
        }
    }, []);

    const handleSetLanguage = (lang: Locale) => {
        setLanguage(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', lang);
        }
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let current: Record<string, any> = getDictionary(language);

        for (const k of keys) {
            if (current[k] === undefined) {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
            current = current[k];
        }

        return current as unknown as string;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
