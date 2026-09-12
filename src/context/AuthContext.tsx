import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPasswordRequest,
  updatePassword as authUpdatePassword,
  getProfile,
} from '../services/authService';
import type { Profile } from '../types';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** The Supabase auth user object (null when logged out) */
  user: SupabaseUser | null;
  /** The public.profiles row for the current user (null until loaded) */
  profile: Profile | null;
  /** Session object */
  session: Session | null;
  /** True during initial session restoration — prevents flash of protected content */
  loading: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  /** Refresh profile from DB (call after profile update) */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile for a given user id
  const loadProfile = useCallback(async (userId: string) => {
    const p = await getProfile(userId);
    setProfile(p);
  }, []);

  // Refresh the current user's profile from DB
  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  // Bootstrap: get the initial session on mount
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Subscribe to future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (!mounted) return;

        setSession(s);
        setUser(s?.user ?? null);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (s?.user) await loadProfile(s.user.id);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }

        // PASSWORD_RECOVERY: session is set; let the reset-password page handle it
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // ── Auth actions ──────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string) => {
    await authSignIn(email, password);
    // onAuthStateChange will fire SIGNED_IN and load profile
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    await authSignUp(email, password, fullName);
    // onAuthStateChange fires SIGNED_IN; profile is created by DB trigger
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    // onAuthStateChange fires SIGNED_OUT, clears user + profile
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await resetPasswordRequest(email);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    await authUpdatePassword(newPassword);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
