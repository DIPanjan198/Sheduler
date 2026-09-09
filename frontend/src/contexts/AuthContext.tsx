import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const clearToast = () => setToast(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const profile = await api.request<any>('/users/me');
          setUser(profile);
          if (profile.business) {
            setBusiness(profile.business);
          }
        } catch (e) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('currentUser');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setUser(res.user);
      setBusiness({
        id: res.user.businessId,
        name: res.user.businessName || 'Business',
        timezone: res.user.timezone || 'America/New_York',
        reminderLeadTimeMinutes: 120
      });
      localStorage.setItem('accessToken', res.tokens?.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(res.user));
      showToast(`Welcome back, ${res.user.firstName}!`);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setUser(res.user);
      setBusiness(res.business);
      localStorage.setItem('accessToken', res.tokens?.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(res.user));
      showToast('Business registered successfully!');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setBusiness(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    showToast('Logged out cleanly', 'info');
  };

  return (
    <AuthContext.Provider value={{
      user,
      business,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      toast,
      showToast,
      clearToast
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
