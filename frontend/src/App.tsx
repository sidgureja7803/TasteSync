import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { DocumentsProvider } from './context/DocumentsContext'
import { ContentProvider } from './context/ContentContext'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './components/ui/toast-container'
import './App.css'

// Layouts
import RootLayout from './layouts/RootLayout'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile.tsx'
import ContentDetail from './pages/ContentDetail'
import Generate from './pages/Generate'

// Auth guard component
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoading } = useAuthContext();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App(): React.ReactElement {
  // Get the Clerk publishable key from environment variables
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthProvider>
        <AppProvider>
          <DocumentsProvider>
            <ContentProvider>
              <ToastProvider>
                <Router>
                  <Routes>
                    {/* Root routes */}
                    <Route element={<RootLayout />}>
                      <Route path="/" element={<Home />} />
                    </Route>
                    
                    {/* Auth routes */}
                    <Route element={<AuthLayout />}>
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                    </Route>
                    
                    {/* Dashboard routes (authenticated) */}
                    <Route element={
                      <RequireAuth>
                        <DashboardLayout />
                      </RequireAuth>
                    }>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/content/:id" element={<ContentDetail />} />
                      <Route path="/generate" element={<Generate />} />
                    </Route>
                    
                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Router>
              </ToastProvider>
            </ContentProvider>
          </DocumentsProvider>
        </AppProvider>
      </AuthProvider>
    </ClerkProvider>
  )
}

export default App