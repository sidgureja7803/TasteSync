import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Types
export interface UIPreferences {
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  uiPreferences: UIPreferences;
  updateUIPreferences: (preferences: Partial<UIPreferences>) => void;
  isLoading: boolean;
}

// Default values
const defaultUIPreferences: UIPreferences = {
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Use localStorage to persist preferences
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('tastesync-dark-mode', false);
  const [uiPreferences, setUIPreferences] = useLocalStorage<UIPreferences>(
    'tastesync-ui-preferences', 
    defaultUIPreferences
  );

  // Apply dark mode to document when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initialize with system preference if not set
  useEffect(() => {
    const initializeTheme = () => {
      // Check if user has already set a preference
      const storedPreference = localStorage.getItem('tastesync-dark-mode');
      
      if (storedPreference === null) {
        // If no stored preference, use system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(systemPrefersDark);
      }
      
      setIsLoading(false);
    };
    
    initializeTheme();
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const storedPreference = localStorage.getItem('tastesync-dark-mode');
      if (storedPreference === null) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Update UI preferences
  const updateUIPreferences = (preferences: Partial<UIPreferences>) => {
    setUIPreferences({
      ...uiPreferences,
      ...preferences
    });
  };

  const value = {
    darkMode,
    toggleDarkMode,
    uiPreferences,
    updateUIPreferences,
    isLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};