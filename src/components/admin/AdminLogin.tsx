import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';
import { adminStore } from '../../lib/adminStore';

interface AdminLoginProps {
  onSuccess: () => void;
  onExit: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onExit }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const settings = adminStore.getSettings();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the admin security password.');
      return;
    }

    setLoading(true);
    setError('');

    // Small delay for authentication feedback
    setTimeout(() => {
      const ok = adminStore.login(password);
      setLoading(false);
      if (ok) {
        onSuccess();
      } else {
        setError('Incorrect password. Access denied.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#100e0c] flex flex-col justify-center items-center p-4 selection:bg-[#d4af37]/30 text-[#f5f5f4]">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#161311] border border-[#2e2823] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
        {/* Back to site link */}
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-xs text-[#a8a29e] hover:text-[#d4af37] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Storefront</span>
        </button>

        {/* Lock Icon & Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#241e19] border border-[#3e352b] flex items-center justify-center mx-auto mb-3 text-[#d4af37]">
            <Lock className="w-6 h-6" />
          </div>
          <div className="text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Secure Baker Portal</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#f5f5f4] mt-1">
            {settings.shopName}
          </h1>
          <p className="text-xs text-[#a8a29e] mt-1">
            Enter the authorized administrator password to access orders, menu catalog, and bakery operations.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#d6d3d1] mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password..."
                value={password}
                autoFocus
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#12100e] border border-[#2d2722] rounded-xl text-sm text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#d6d3d1] p-1"
                aria-label="Toggle password view"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[10px] text-[#78716c] mt-1.5 flex justify-between">
              <span>Protected portal</span>
              <span>Default: admin123</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#d4af37] hover:bg-[#e2be53] text-[#12100e] font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
