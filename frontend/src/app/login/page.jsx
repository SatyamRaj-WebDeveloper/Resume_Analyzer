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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 text-zinc-300">
      <Card className="w-full max-w-md shadow-2xl bg-zinc-900 border-zinc-800 rounded-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-zinc-100">Welcome back</CardTitle>
          <CardDescription className="text-zinc-500">Enter your credentials to access the analyzer.</CardDescription>
        </CardHeader>
        <CardContent>
          {successMsg && (
            <div className="p-3 mb-6 bg-emerald-500/10 text-emerald-500 text-sm font-medium rounded-md border border-emerald-500/20 text-center">
              {successMsg}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400">Email</Label>
              <Input 
                id="email" type="email" placeholder="m@example.com" required 
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-400">Password</Label>
              </div>
              <Input 
                id="password" type="password" required 
                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
              />
            </div>
            
            {error && <p className="text-sm text-rose-400 font-medium">{error}</p>}
            
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-50 mt-2 transition-colors" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push('/register')} className="text-emerald-500 hover:text-emerald-400 hover:underline font-semibold transition-colors">
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}