import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Something went wrong');
      }
      setStatus('done');
    } catch (err: any) {
      setError(err.message);
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Check your inbox</h2>
          <p className="text-slate-500 text-sm">If <strong>{email}</strong> is registered, we've sent a password reset link. Check your spam folder if you don't see it.</p>
          <Link to="/login" className="inline-block mt-6 text-sm text-primary hover:underline">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Forgot your password?</h1>
        <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Remembered it? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordView;
