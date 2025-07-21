import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold">TasteSync</Link>
        </div>
        
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <Outlet />
        </div>
        
        <div className="mt-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} TasteSync. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;