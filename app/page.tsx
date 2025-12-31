'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaGem, FaEnvelope, FaLock } from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-gold-500/20">
          {/* Logo and Title */}
          <div className="text-center mb-8 slide-up">
            <div className="inline-block p-4 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl mb-4 gold-glow">
              <FaGem className="text-4xl text-black" />
            </div>
            <h1 className="text-3xl font-display font-bold gold-text mb-2">
              Raju Seakh Jewelry
            </h1>
            <p className="text-zinc-400 font-body">Admin Panel Login</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 slide-up" style={{ animationDelay: '0.1s' }}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 block">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 block">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="spinner w-5 h-5 border-2"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-xs text-zinc-400 mb-2 font-semibold">Demo Credentials:</p>
            <div className="text-xs text-zinc-500 space-y-1">
              <p>Admin: admin@jewelry.com / admin123</p>
              <p>Employee: employee@jewelry.com / employee123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-sm mt-6">
          © 2025 Raju Seakh Jewelry. All rights reserved.
        </p>
      </div>
    </div>
  );
}
