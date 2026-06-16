import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from './UIElements/Button';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await login(email, password);
      if (response.isAdmin) {
        window.location.hash = '#/admin';
      } else {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 space-y-5">
          {error && <p className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex justify-end">
            <a href="#/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
          </div>
          <Button type="submit" variant="primary" className="w-full !py-3 !text-base !rounded-xl">Login</Button>
          <p className="text-center text-sm text-slate-500">
            Don't have an account? <a href="#/register" className="font-semibold text-primary hover:underline">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginView;