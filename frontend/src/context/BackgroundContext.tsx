import { useState, type ReactNode } from 'react';
import { BackgroundContext } from './background-context';

export function BackgroundProvider({ children }: { children: ReactNode }) {
    const [backgroundImage, setBg] = useState<string | null>(() => localStorage.getItem('crowdpass_custom_bg'));

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
}
