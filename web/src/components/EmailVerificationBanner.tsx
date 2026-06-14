import React, { useState } from 'react';
import { sendVerificationEmail } from '../services/api';

interface Props {
  mode?: 'banner' | 'block'; // banner = soft nudge, block = gate before checkout
}

const EmailVerificationBanner: React.FC<Props> = ({ mode = 'banner' }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [error, setError] = useState('');

  const handleSend = async () => {
    setStatus('loading');
    setError('');
    try {
      await sendVerificationEmail();
      setStatus('sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send. Try again.');
      setStatus('idle');
    }
  };

  if (status === 'sent') {
    return (
      <div className={`flex items-start gap-3 rounded-xl p-4 bg-green-50 border border-green-200 ${mode === 'block' ? 'mb-6' : 'mb-4'}`}>
        <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        <div>
          <p className="text-sm font-semibold text-green-800">Verification email sent!</p>
          <p className="text-xs text-green-700 mt-0.5">Check your inbox and click the link to verify. Check spam if you don't see it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl p-4 border ${
      mode === 'block'
        ? 'bg-amber-50 border-amber-200 mb-6'
        : 'bg-blue-50 border-blue-200 mb-4'
    }`}>
      <svg className={`w-5 h-5 shrink-0 mt-0.5 ${mode === 'block' ? 'text-amber-500' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${mode === 'block' ? 'text-amber-800' : 'text-blue-800'}`}>
          {mode === 'block' ? 'Verify your email to place orders' : 'Your email is not verified'}
        </p>
        <p className={`text-xs mt-0.5 ${mode === 'block' ? 'text-amber-700' : 'text-blue-600'}`}>
          {mode === 'block'
            ? 'We need to verify your email before you can checkout. It only takes a moment.'
            : 'Verify your email to receive order confirmations and account updates.'}
        </p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <button
        onClick={handleSend}
        disabled={status === 'loading'}
        className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${
          mode === 'block'
            ? 'bg-amber-500 hover:bg-amber-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {status === 'loading' ? '…' : 'Send Link'}
      </button>
    </div>
  );
};

export default EmailVerificationBanner;
