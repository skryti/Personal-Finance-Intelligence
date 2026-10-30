import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Dynamic Redirect URL Resolution:
 * Calculates redirect target based on environment (Vercel production or local dev)
 */
export const getURL = () => {
  let url =
    import.meta.env.VITE_SITE_URL || // Optional manual override
    (typeof window !== 'undefined' && window.location.origin) ||
    'http://localhost:5173';
  // Clean trailing slash
  return url.replace(/\/+$/, '');
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  loginError: string | null;
  clearLoginError: () => void;
  handleGoogleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const clearLoginError = () => setLoginError(null);

  useEffect(() => {
    // 1. Catch OAuth errors from the URL on mount
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error') || urlParams.get('error_code');
      const errorDescription = urlParams.get('error_description');

      if (errorParam) {
        const friendlyMessage =
          errorParam === 'access_denied'
            ? 'Login was canceled or unauthorized.'
            : errorDescription
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : 'Login was canceled or unauthorized.';
        setLoginError(friendlyMessage);

        // Clean error params from the browser URL cleanly without full reload
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    // 2. Fetch initial session if already signed in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session retrieval error:', error.message);
      }
      setSession(session);
      setLoading(false);
    });

    // 3. Listen for auth changes (such as redirect back from Google OAuth or sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);

      // Clean URL Hash & Query Parameters After OAuth Callback
      if (event === 'SIGNED_IN') {
        if (
          typeof window !== 'undefined' &&
          (window.location.hash || window.location.search.includes('code='))
        ) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoginError(null);
      const redirectUrl = getURL();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
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
        isLoading: loading,
        loginError,
        clearLoginError,
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
