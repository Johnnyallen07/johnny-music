import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dictionaries, Locale, getDictionary } from '@/i18n/dictionaries';

type LanguageContextType = {
    language: Locale;
    setLanguage: (lang: Locale) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Locale>('en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load saved language preference from AsyncStorage
        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem('language');
                if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
                    setLanguage(savedLanguage as Locale);
                }
            } catch (error) {
                console.error('Failed to load language preference:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadLanguage();
    }, []);

    const handleSetLanguage = async (lang: Locale) => {
        setLanguage(lang);
        try {
            await AsyncStorage.setItem('language', lang);
        } catch (error) {
            console.error('Failed to save language preference:', error);
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

    // Don't render children until language preference is loaded
    if (!isLoaded) {
        return null;
    }

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
