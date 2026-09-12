import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function validateEmail(val: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    setFormError('');

    if (!email.trim()) { setEmailError('Please enter your email.'); return; }
    if (!validateEmail(email)) { setEmailError('Please enter a valid email address.'); return; }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-den-bg p-6">
      {/* Background decoration */}
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
          {sent ? (
            /* Success state */
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                <CheckCircle2 size={26} className="text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-den-text mb-2">Check your email</h1>
              <p className="text-sm text-den-muted leading-relaxed mb-2">
                We've sent a password reset link to
              </p>
              <p className="text-sm font-medium text-den-text mb-6 break-all">{email}</p>
              <p className="text-xs text-den-muted mb-8">
                Click the link in the email to set a new password. The link expires in 1 hour.
              </p>
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => { setSent(false); setEmail(''); }}
              >
                Send to a different email
              </Button>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-den-surface border border-den-border flex items-center justify-center">
                  <Mail size={18} className="text-den-muted" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-den-text">Forgot password?</h1>
                  <p className="text-xs text-den-muted">We'll send a reset link to your email</p>
                </div>
              </div>

              {formError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(''); setFormError(''); }}
                  error={emailError}
                  autoComplete="email"
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-den-muted hover:text-den-text transition-colors"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
