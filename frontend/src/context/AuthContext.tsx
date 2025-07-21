import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth, useUser, useClerk, useSession } from '@clerk/clerk-react';
import { setAuthToken } from '../services/api';

interface AuthContextType {
  isSignedIn: boolean;
  isLoading: boolean;
  userId: string | null;
  user: any | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { session } = useSession();

  // Set the auth token whenever the session changes
  useEffect(() => {
    const updateToken = async () => {
      if (session) {
        const token = await session.getToken();
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
    };

    updateToken();
  }, [session]);

  const value = {
    isSignedIn: isSignedIn || false,
    isLoading: !isLoaded,
    userId: userId || null,
    user: user || null,
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
    email: user?.emailAddresses?.[0]?.emailAddress || null,
    profileImageUrl: user?.imageUrl || null,
    signOut: async () => {
      setAuthToken(null);
      await signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};