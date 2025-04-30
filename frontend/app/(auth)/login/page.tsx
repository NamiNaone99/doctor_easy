'use client';

import { FormEvent, ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/footer/page';
import { toast } from 'react-hot-toast';
import { useUser } from 'context/UserContext';
import { loginAction } from 'app/actions/auth';
export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const { fetchUser } = useUser();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await loginAction(formData);

      if (result.success) {
        toast.success('Login successful');
        await fetchUser();
        router.push('/');
      } else {
        setError(result.error || 'Login failed');
        toast.error(result.error || 'Login failed');
      }
      // else {
      //   throw new Error("Login failed");
      // }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 items-center justify-center bg-gray-100 dark:bg-[#141414]">
      <Card className="w-full max-w-md p-4">
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              className="bg-gray-100 dark:bg-[#212121]"
              required
              name="username"
              placeholder="Username"
              onChange={handleChange}
            />
            <Input
              className="bg-gray-100 dark:bg-[#212121]"
              required
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <p className="text-center text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-gray-800 dark:text-gray-200 hover:underline font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
      <Footer />
    </div>
  );
}
