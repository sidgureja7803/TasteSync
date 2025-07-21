import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">TasteSync</Link>
          <nav className="flex gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link to="/signup" className="text-gray-600 hover:text-gray-900">Sign Up</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} TasteSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;