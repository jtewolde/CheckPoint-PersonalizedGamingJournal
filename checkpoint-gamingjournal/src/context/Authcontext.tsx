'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  user?: { name?: string, email?: string, username?: string};
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      console.log("Session Data :", data)
      setIsAuthenticated(!!data?.user);
      setUser(data?.user || null)
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, isAuthLoading}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};