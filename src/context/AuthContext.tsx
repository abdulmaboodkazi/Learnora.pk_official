import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api, setAuthToken, getSessionId, resetSessionId } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  oauthLogin: (provider: 'google' | 'apple') => Promise<void>;
  demoLogin: (role: 'customer' | 'admin') => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handlePostAuth = async (token: string, loggedUser: User) => {
    setAuthToken(token);
    setUser(loggedUser);
    // Merge guest cart
    const sid = getSessionId();
    try {
      await api.mergeCart(sid);
    } catch {
      // quiet merge
    }
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    await handlePostAuth(res.token, res.user);
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    const res = await api.register({ name, email, password: pass, phone });
    await handlePostAuth(res.token, res.user);
  };

  const oauthLogin = async (provider: 'google' | 'apple') => {
    const demoEmail = provider === 'google' ? 'google.parent@learnora.com' : 'apple.parent@privaterelay.appleid.com';
    const demoName = provider === 'google' ? 'Google Customer' : 'Apple Customer';
    const res = await api.oauthLogin({
      provider,
      email: demoEmail,
      name: demoName,
    });
    await handlePostAuth(res.token, res.user);
  };

  const demoLogin = async (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      await login('admin@learnora.com', 'admin123');
    } else {
      await login('parent@learnora.com', 'parent123');
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    resetSessionId();
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        oauthLogin,
        demoLogin,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
