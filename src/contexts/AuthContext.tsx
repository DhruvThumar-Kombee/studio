
"use client";

import type { User, AuthContextType } from '@/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  }, []);

  const login = (userData: { user: User; token: string }) => {
    setUser(userData.user);
    setToken(userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    localStorage.setItem('token', userData.token);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
