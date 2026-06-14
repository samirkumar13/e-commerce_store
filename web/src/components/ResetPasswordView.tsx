import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const ResetPasswordView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setStatus('done');
    } catch (err: any) {
      setError(err.message);
      setStatus('idle');
    }
  };

  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="text-primary hover:underline text-sm">Request a new link</Link>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Password updated!</h2>
          <p className="text-slate-500 text-sm mb-6">Your password has been reset. You can now log in with your new password.</p>
          <Link to="/login" className="inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Set new password</h1>
        <p className="text-slate-500 text-sm mb-6">Choose a strong password you haven't used before.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Repeat your password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordView;
