'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFakegram } from '../utils/store';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const { currentUser, isLoading } = useFakegram();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.push('/');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 font-sans justify-center items-center">
        <div className="h-12 w-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center animate-pulse">
          <div className="h-4 w-4 rounded-full bg-brand-blue" />
        </div>
      </div>
    );
  }

  if (currentUser) {
    return null; // Will redirect shortly
  }

  return <LoginForm />;
}
