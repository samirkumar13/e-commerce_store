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
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
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
          <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required 
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
          />
        </div>
        <Button type="submit" variant="primary" className="w-full">Login</Button>
        <p className="text-center text-sm text-slate-600">
          Don't have an account? <a href="#/register" className="font-medium text-primary hover:underline">Sign up</a>
        </p>
      </form>
    </div>
  );
};

export default LoginView;