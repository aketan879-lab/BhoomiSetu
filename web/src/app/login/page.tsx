'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, KeyRound, Building2, AlertCircle } from 'lucide-react';
import { useWebLanguage } from '../../context/WebLanguageContext';

const BACKEND_URL = 'http://localhost:8000';

export default function LoginPage() {
  const router = useRouter();
  const { lang, t } = useWebLanguage();
  
  // Admin Credentials state (pre-filled with Tahsildar1 / 123456)
  const [username, setUsername] = useState('Tahsildar1');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.detail || 'Invalid username or password.');
        setLoading(false);
        return;
      }

      // Store Auth Token and User Details
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setLoading(false);
      router.push('/dashboard');
    } catch (err: any) {
      setLoading(false);
      // Fallback redirect for offline demo
      router.push('/dashboard');
    }
  };

  const fillAdminCreds = () => {
    setUsername('Tahsildar1');
    setPassword('123456');
    setErrorMessage('');
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      {/* Step Badge */}
      <div className="text-center">
        <span className="inline-block bg-blue-100 text-blue-900 text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
          STEP 2 OF 3 • ADMIN SIGN IN PORTAL
        </span>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          <ShieldCheck size={14} /> Official Revenue Officer Portal
        </div>
        <h1 className="text-2xl font-black text-gray-900">👑 Web Admin Portal</h1>
        <p className="text-gray-500 text-sm">Revenue Officers, Tehsildars & Collectors Sign In</p>
      </div>

      {/* Admin Demo Credentials Box */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2">
        <div className="font-bold text-xs text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
          🔑 Pre-Configured Admin Credentials
        </div>
        <button
          type="button"
          onClick={fillAdminCreds}
          className="w-full p-3 rounded-lg border text-left bg-white border-blue-600 shadow-sm font-bold text-blue-900"
        >
          <div className="font-bold text-gray-900">👑 Web Admin Officer (Tahsildar1)</div>
          <div className="text-xs text-gray-600 font-mono mt-1">Username: Tahsildar1</div>
          <div className="text-xs text-gray-600 font-mono">Password: 123456</div>
        </button>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Username / उपयोगकर्ता नाम</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-semibold text-gray-900"
            placeholder="e.g. Tahsildar1"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Password / पासवर्ड</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 font-semibold text-gray-900"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-sm rounded-lg shadow transition flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <span className="animate-pulse">Signing in...</span>
          ) : (
            <>Admin Sign In / प्रवेश करें <KeyRound size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
}
