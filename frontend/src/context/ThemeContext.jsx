/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('hiru-theme');
        // Accept older 'light' value by mapping it to 'white'
        if (saved === 'light') return 'white';
        return saved || 'dark';
    });

    useEffect(() => {
        // Migrate legacy value 'light' -> 'white' if present
        const saved = localStorage.getItem('hiru-theme');
        if (saved === 'light') {
            localStorage.setItem('hiru-theme', 'white');
            setTheme('white');
            return;
        }

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hiru-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'white' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
