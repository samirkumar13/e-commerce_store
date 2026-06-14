import React, { useState } from 'react';
import { Mail } from 'lucide-react';

const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    return 'http://localhost:5000/api';
  return '/api';
};

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${getApiUrl()}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok || res.status === 200) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect. Please try again.');
    }
  };

  return (
    <section className="bg-gradient-to-r from-cyan-600 to-cyan-700 py-14">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Stay in the Loop</h2>
        <p className="text-cyan-100 mb-8 max-w-md mx-auto text-sm">
          Get the latest products, deals, and tutorials delivered straight to your inbox.
        </p>

        {status === 'success' ? (
          <div className="inline-flex items-center gap-2 bg-white/20 text-white rounded-xl px-6 py-3 font-medium">
            ✓ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-white text-cyan-700 font-semibold rounded-xl hover:bg-cyan-50 transition-colors text-sm disabled:opacity-60 whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-cyan-100 text-sm">{message}</p>
        )}
        <p className="mt-4 text-cyan-200 text-xs">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  );
};

export default NewsletterSection;
