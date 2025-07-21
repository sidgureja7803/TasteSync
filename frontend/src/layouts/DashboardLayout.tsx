import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import Sidebar from '../components/navigation/Sidebar';
import Topbar from '../components/navigation/Topbar';

const DashboardLayout: React.FC = () => {
  const { isSignedIn, isLoading, firstName, lastName, profileImageUrl, signOut } = useAuthContext();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for user's preferred color scheme
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Topbar */}
      <Topbar
        firstName={firstName}
        lastName={lastName}
        profileImageUrl={profileImageUrl}
        signOut={signOut}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          firstName={firstName}
          lastName={lastName}
          profileImageUrl={profileImageUrl}
          signOut={signOut}
        />
        
        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      <footer className="bg-muted py-4 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} TasteSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;