'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMsg('Account created successfully! Please sign in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/');
      router.refresh(); 
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-800 p-4 text-slate-200">
      <Card className="w-full max-w-md shadow-xl bg-slate-700 border-slate-600 rounded-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-slate-100">Welcome back</CardTitle>
          <CardDescription className="text-slate-400">Enter your credentials to access the analyzer.</CardDescription>
        </CardHeader>
        <CardContent>
          {successMsg && (
            <div className="p-3 mb-6 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-md border border-emerald-500/20 text-center">
              {successMsg}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input 
                id="email" type="email" placeholder="m@example.com" required 
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
              </div>
              <Input 
                id="password" type="password" required 
                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
              />
            </div>
            
            {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
            
            <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white mt-2" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push('/register')} className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition-colors">
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}