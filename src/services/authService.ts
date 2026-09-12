import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

// ─── Friendly error mapping ───────────────────────────────────────────────────

/**
 * Translates raw Supabase/PostgreSQL error messages into friendly
 * user-facing strings. Never expose raw technical messages to users.
 */
export function mapAuthError(error: unknown): string {
  if (!error) return 'Something went wrong. Please try again.';

  const msg =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : String(error);

  const lower = msg.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid email or password'))
    return 'Invalid email or password.';
  if (lower.includes('email not confirmed'))
    return 'Please confirm your email address before signing in.';
  if (lower.includes('user already registered') || lower.includes('already been registered'))
    return 'An account with this email already exists.';
  if (lower.includes('password should be at least'))
    return 'Password must be at least 8 characters.';
  if (lower.includes('rate limit') || lower.includes('too many requests'))
    return 'Too many attempts. Please wait a moment and try again.';
  if (lower.includes('network') || lower.includes('fetch'))
    return 'Network error. Please check your connection and try again.';
  if (lower.includes('email') && lower.includes('invalid'))
    return 'Please enter a valid email address.';
  if (lower.includes('token') || lower.includes('expired'))
    return 'Your reset link has expired. Please request a new one.';

  return 'Something went wrong. Please try again.';
}

// ─── Auth operations ─────────────────────────────────────────────────────────

/** Sign in with email + password */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(mapAuthError(error));
  return data;
}

/**
 * Sign up with email + password.
 * full_name is passed as user metadata; the DB trigger reads it
 * server-side. The role is ALWAYS set to 'admin' by the trigger,
 * regardless of what metadata the client provides.
 */
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) throw new Error(mapAuthError(error));
  return data;
}

/** Sign out the current user */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(mapAuthError(error));
}

/** Send a password-reset email */
export async function resetPasswordRequest(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(mapAuthError(error));
}

/** Set a new password (used on the reset-password page after recovery) */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(mapAuthError(error));
}

// ─── Profile operations ───────────────────────────────────────────────────────

/** Fetch a user's profile from the public.profiles table */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = "Row not found" — profile may not exist yet (trigger delay)
    if (error.code === 'PGRST116') return null;
    console.error('[authService.getProfile]', error.message);
    return null;
  }

  return data as Profile;
}

/**
 * Update display name and/or avatar URL.
 * Role is deliberately excluded — it must only be changed via the DB directly.
 */
export async function updateProfile(
  userId: string,
  updates: Pick<Profile, 'full_name' | 'avatar_url'>
): Promise<Profile | null> {
  // The Supabase JS client's generic typing for .update() is strict;
  // we use 'as any' only here to avoid the 'never' inference issue.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    full_name: updates.full_name,
    avatar_url: updates.avatar_url,
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[authService.updateProfile]', error.message);
    return null;
  }

  return data as Profile;
}
