import React, { createContext, useContext, useState, useEffect } from 'react';

interface BackgroundContextType {
    backgroundImage: string | null;
    setBackgroundImage: (url: string | null) => void;
    uploadBackgroundFile: (file: File) => Promise<void>;
    resetBackground: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [backgroundImage, setBg] = useState<string | null>(null);

    useEffect(() => {
        const savedBg = localStorage.getItem('crowdpass_custom_bg');
        if (savedBg) {
            setBg(savedBg);
        }
    }, []);

    const setBackgroundImage = (url: string | null) => {
        if (url) {
            localStorage.setItem('crowdpass_custom_bg', url);
            setBg(url);
        } else {
            resetBackground();
        }
    };

    const uploadBackgroundFile = (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                if (base64) {
                    localStorage.setItem('crowdpass_custom_bg', base64);
                    setBg(base64);
                    resolve();
                } else {
                    reject(new Error('Caricamento immagine fallito'));
                }
            };
            reader.onerror = () => reject(new Error('Errore durante la lettura del file'));
            reader.readAsDataURL(file);
        });
    };

    const resetBackground = () => {
        localStorage.removeItem('crowdpass_custom_bg');
        setBg(null);
    };

    return (
        <BackgroundContext.Provider value={{ backgroundImage, setBackgroundImage, uploadBackgroundFile, resetBackground }}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackground = () => {
    const context = useContext(BackgroundContext);
    if (!context) {
        throw new Error('useBackground must be used within a BackgroundProvider');
    }
    return context;
};
