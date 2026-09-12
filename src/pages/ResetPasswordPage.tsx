import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, KeyRound, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Supabase sends a PASSWORD_RECOVERY event via the URL hash.
  // The client lib processes it automatically through onAuthStateChange.
  // We just need to be mounted and wait for that session to be set.
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event which fires when the user
    // clicks the reset link from their email
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
          setSessionReady(true);
        }
      }
    );

    // Also check if there's already a session (user refreshed the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!password) e.password = 'Please enter a new password.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFormError('');
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-den-bg p-6">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-den-accent/4 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-den-accent/10 border border-den-accent/25">
            <Zap size={18} className="text-den-accent" />
          </div>
          <div className="leading-none select-none">
            <div className="text-[9px] font-bold tracking-[0.25em] text-den-muted uppercase">The</div>
            <div className="text-[14px] font-extrabold tracking-tight text-den-text leading-none">Fitness</div>
            <div className="text-[14px] font-extrabold tracking-wider text-den-accent leading-none">Den</div>
          </div>
        </div>

        <div className="bg-den-card border border-den-border rounded-2xl p-8 shadow-den-xl">
          {done ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                <CheckCircle2 size={26} className="text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-den-text mb-2">Password updated!</h1>
              <p className="text-sm text-den-muted leading-relaxed">
                Your password has been changed. Redirecting you to sign in…
              </p>
            </div>
          ) : !sessionReady ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <KeyRound size={18} className="text-amber-400" />
              </div>
              <h1 className="text-base font-bold text-den-text mb-2">Verifying reset link…</h1>
              <p className="text-sm text-den-muted">
                If this page doesn't load, your reset link may have expired.{' '}
                <a href="/forgot-password" className="text-den-accent hover:underline">
                  Request a new one.
                </a>
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-den-surface border border-den-border flex items-center justify-center">
                  <KeyRound size={18} className="text-den-muted" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-den-text">Set new password</h1>
                  <p className="text-xs text-den-muted">Choose a strong password</p>
                </div>
              </div>

              {formError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <Input
                  label="New password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => { const n = { ...p }; delete n.password; return n; }); }}
                  error={errors.password}
                  autoComplete="new-password"
                  autoFocus
                  hint="At least 8 characters"
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setErrors(p => { const n = { ...p }; delete n.confirmPassword; return n; }); }}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  Update Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
