
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as apiService from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<any>;
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.getMe().then(userData => {
        setUser(userData); // The backend now returns the full user object including isAdmin
      }).catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = (response: any) => {
    localStorage.setItem('token', response.token);
    const userData: User = {
      id: response.id,
      name: response.name,
      email: response.email,
      isAdmin: response.isAdmin,
      isVerified: response.isVerified ?? false,
      walletBalance: response.walletBalance ?? 0,
      referralCode: response.referralCode,
    };
    setUser(userData);
    return response;
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.loginUser({ email, password });
    return handleAuthSuccess(response);
  };
  
  const register = async (name: string, email: string, password: string, referralCode?: string) => {
    const response = await apiService.registerUser({ name, email, password, referralCode });
    return handleAuthSuccess(response);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    window.location.hash = '#/';
  };

  const value = { user, login, logout, register, loading, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
