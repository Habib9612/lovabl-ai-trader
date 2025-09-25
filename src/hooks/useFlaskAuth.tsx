import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const FlaskAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useFlaskAuth = () => {
  const context = useContext(FlaskAuthContext);
  if (!context) {
    throw new Error('useFlaskAuth must be used within a FlaskAuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const FlaskAuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token is still valid by making a request
      apiClient.health().then(() => {
        // Token is valid, but we need user info
        // For now, we'll just set loading to false
        setLoading(false);
      }).catch(() => {
        // Token is invalid, clear it
        apiClient.clearToken();
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const response = await apiClient.register(email, password);
      if (response.error) {
        return { error: { message: response.error } };
      }
      return { error: null };
    } catch (error) {
      return { error: { message: 'Registration failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      if (response.error) {
        return { error: { message: response.error } };
      }
      
      if (response.data?.user) {
        setUser(response.data.user);
      }
      
      return { error: null };
    } catch (error) {
      return { error: { message: 'Login failed' } };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      return { error: null };
    } catch (error) {
      return { error: { message: 'Logout failed' } };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <FlaskAuthContext.Provider value={value}>
      {children}
    </FlaskAuthContext.Provider>
  );
};
