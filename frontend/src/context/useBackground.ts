import { useContext } from 'react';
import { BackgroundContext } from './background-context';

export function useBackground() {
    const context = useContext(BackgroundContext);
    if (!context) {
        throw new Error('useBackground must be used within a BackgroundProvider');
    }
    return context;
}
