import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  loginError: string | null;
  handleGoogleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch initial session if already signed in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session retrieval error:', error.message);
      }
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes (such as redirect back from Google OAuth or sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoginError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Returns back to http://localhost:5173
        },
      });

      if (error) {
        console.error('Login error:', error.message);
        setLoginError(error.message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown login error';
      console.error('Login error:', message);
      setLoginError(message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      }
      setSession(null);
    } catch (err: unknown) {
      console.error('Logout error:', err);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        loginError,
        handleGoogleLogin,
        handleLogout,
      }}
    >
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
