import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from './UIElements/Button';

interface RegisterViewProps {
  onRegisterSuccess: () => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  // Pre-fill from URL ?ref=CODE but let user type it manually too
  const urlRef = new URLSearchParams(window.location.search).get('ref') || '';
  const [referralCode, setReferralCode] = useState(urlRef.toUpperCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(name, email, password, referralCode.trim() || undefined);
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Create an Account</h1>
      {referralCode && (
        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <span className="text-lg">🎁</span>
          <span>Referral code applied! You'll both earn <strong>100 bonus points</strong> after your first order.</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-slate-700">
            Referral Code <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="mt-1 relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4H6m6 6h6a4 4 0 014 4v1M6 20h12" /></svg>
            </span>
            <input
              type="text"
              id="referralCode"
              value={referralCode}
              onChange={e => setReferralCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={10}
              className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary uppercase tracking-widest text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">Have a friend's referral code? Enter it here to earn bonus points.</p>
        </div>
        <Button type="submit" variant="primary" className="w-full">Create Account</Button>
        <p className="text-center text-sm text-slate-600">
          Already have an account? <a href="#/login" className="font-medium text-primary hover:underline">Log in</a>
        </p>
      </form>
    </div>
  );
};

export default RegisterView;