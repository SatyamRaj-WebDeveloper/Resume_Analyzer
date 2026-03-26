'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      router.push('/login?registered=true');
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
          <CardTitle className="text-3xl font-bold text-zinc-100">Create an account</CardTitle>
          <CardDescription className="text-zinc-500">Enter your details below to start analyzing resumes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-400">Full Name</Label>
              <Input 
                id="name" placeholder="John Doe" required 
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400">Email</Label>
              <Input 
                id="email" type="email" placeholder="m@example.com" required 
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400">Password</Label>
              <Input 
                id="password" type="password" required 
                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
              />
            </div>
            
            {error && <p className="text-sm text-rose-400 font-medium">{error}</p>}
            
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-50 mt-2 transition-colors" type="submit" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} className="text-emerald-500 hover:text-emerald-400 hover:underline font-semibold transition-colors">
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}