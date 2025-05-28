import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, supabase, AuthError } from '@/lib/supabase';
import { fetchSubscription } from '@/lib/stripe/supabase';
import { queryClient } from '@/lib/queryClient';
import { DEFAULT_SUBSCRIPTION_STATE } from '@/lib/subscription';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const preloadSubscription = useCallback(async (userId: string) => {
    try {
      const subscription = await fetchSubscription(userId);
      queryClient.setQueryData(['subscription'], subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to preload subscription:', error);
      queryClient.setQueryData(['subscription'], DEFAULT_SUBSCRIPTION_STATE);
      return DEFAULT_SUBSCRIPTION_STATE;
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (data.session?.user) {
        // Preload subscription data in the background
        // Don't await to avoid blocking the login flow
        preloadSubscription(data.session.user.id).catch(console.error);
      }
      
      return { error };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error as AuthError };
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const value = {
    user,
    loading: loading || subscriptionLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
