import { createContext } from 'react';

export interface BackgroundContextValue {
    backgroundImage: string | null;
    setBackgroundImage: (url: string | null) => void;
    uploadBackgroundFile: (file: File) => Promise<void>;
    resetBackground: () => void;
}

export const BackgroundContext = createContext<BackgroundContextValue | undefined>(undefined);
