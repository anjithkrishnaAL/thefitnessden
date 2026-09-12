import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, ArrowRight, Dumbbell, Activity, TrendingUp } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  { icon: <Dumbbell size={16} />, label: 'Member management at your fingertips' },
  { icon: <Activity size={16} />, label: 'Real-time attendance tracking' },
  { icon: <TrendingUp size={16} />, label: 'Powerful analytics & reports' },
];

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  function validateEmail(val: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function validate(): boolean {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setFormError('');

    if (!email.trim()) { setEmailError('Please enter your email.'); valid = false; }
    else if (!validateEmail(email)) { setEmailError('Please enter a valid email address.'); valid = false; }
    if (!password) { setPasswordError('Please enter your password.'); valid = false; }

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-den-bg">

      {/* ── Left panel: Branding ───────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-hero-gradient">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(163,230,53,0.5) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(163,230,53,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Accent glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-den-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-den-accent/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-den-accent/10 border border-den-accent/25">
              <Zap size={20} className="text-den-accent" />
            </div>
            <div className="leading-none select-none">
              <div className="text-[10px] font-bold tracking-[0.25em] text-den-muted uppercase">The</div>
              <div className="text-[17px] font-extrabold tracking-tight text-den-text leading-none">Fitness</div>
              <div className="text-[17px] font-extrabold tracking-wider text-den-accent leading-none">Den</div>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-[0.3em] text-den-accent uppercase mb-4">
                Gym Management System
              </p>
              <h2 className="text-5xl font-black leading-[1.1] text-den-text mb-2">
                Train.{' '}
                <span className="text-gradient-accent">Track.</span>{' '}
                Transform.
              </h2>
              <p className="text-base text-den-muted mt-4 leading-relaxed">
                The premium platform for modern fitness businesses. Manage members, track performance, and grow your gym — all in one place.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {FEATURES.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-den-muted">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-den-accent/10 border border-den-accent/20 text-den-accent shrink-0">
                    {feature.icon}
                  </span>
                  {feature.label}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-den-muted/50 select-none">
            © 2026 TheFitnessDen. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel: Login form ────────────────────────── */}
      <div className="flex flex-col items-center justify-center flex-1 lg:max-w-md xl:max-w-lg p-6 sm:p-10">
        {/* Mobile brand */}
        <div className="flex lg:hidden items-center gap-3 mb-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-den-accent/10 border border-den-accent/25">
            <Zap size={18} className="text-den-accent" />
          </div>
          <div className="leading-none select-none">
            <div className="text-[9px] font-bold tracking-[0.25em] text-den-muted uppercase">The</div>
            <div className="text-[14px] font-extrabold tracking-tight text-den-text leading-none">Fitness</div>
            <div className="text-[14px] font-extrabold tracking-wider text-den-accent leading-none">Den</div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-den-text">Welcome back</h1>
            <p className="text-sm text-den-muted mt-1.5">Sign in to your account to continue</p>
          </div>

          {/* Form-level error */}
          {formError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
              {formError}
            </div>
          )}

          {/* Form */}
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
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError(''); setFormError(''); }}
                error={passwordError}
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs text-den-muted hover:text-den-accent transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className={cn('flex items-center gap-3 my-6', 'text-xs text-den-muted')}>
            <div className="flex-1 h-px bg-den-border" />
            <span>or</span>
            <div className="flex-1 h-px bg-den-border" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-den-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-den-accent hover:text-den-accent-dim font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
