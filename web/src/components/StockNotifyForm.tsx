import React, { useState } from 'react';
import { subscribeStockNotification } from '../services/api';

interface StockNotifyFormProps {
  productId: string;
}

const StockNotifyForm: React.FC<StockNotifyFormProps> = ({ productId }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const data = await subscribeStockNotification(productId, email);
      setStatus('success');
      setMessage((data as any).message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        {message}
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <p className="text-sm font-medium text-amber-800 mb-3">
        Get notified when this item is back in stock
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          className="flex-1 px-3 py-2 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 bg-white"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? '…' : 'Notify Me'}
        </button>
      </form>
      {status === 'error' && <p className="mt-2 text-xs text-red-600">{message}</p>}
    </div>
  );
};

export default StockNotifyForm;
