'use client';

import React from 'react';
import { useFakegram } from './utils/store';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import AccentColorPicker from './components/AccentColorPicker';

export default function Home() {
  const { currentUser, isLoading } = useFakegram();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 font-sans">
        {/* Navigation Skeleton */}
        <header className="border-b border-zinc-200 bg-white py-4 px-6 flex justify-between items-center">
          <div className="h-6 w-20 bg-zinc-200 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-8 w-24 bg-zinc-200 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-zinc-200 rounded-full animate-pulse" />
          </div>
        </header>

        {/* Dashboard Skeleton */}
        <div className="mx-auto grid max-w-6xl w-full grid-cols-1 lg:grid-cols-12 gap-8 px-4 py-8 flex-1">
          {/* Profile Sidebar Skeleton */}
          <div className="lg:col-span-4 h-80 rounded-3xl bg-white border border-zinc-200 p-6 flex flex-col items-center gap-4 animate-pulse shadow-sm">
            <div className="h-24 w-24 rounded-full bg-zinc-200" />
            <div className="h-4 w-32 bg-zinc-200 rounded" />
            <div className="h-3 w-24 bg-zinc-200 rounded" />
            <div className="h-10 w-full bg-zinc-200 rounded-xl mt-4" />
          </div>

          {/* Stories & Feed Skeleton */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tray Skeleton */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 flex gap-4 animate-pulse shadow-sm">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-zinc-200" />
                  <div className="h-3 w-10 bg-zinc-200 rounded" />
                </div>
              ))}
            </div>

            {/* Feed Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-3xl border border-zinc-200 bg-white p-4 space-y-4 animate-pulse shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-200" />
                    <div className="h-3 w-20 bg-zinc-200 rounded" />
                  </div>
                  <div className="aspect-[3/4] bg-zinc-200 rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginForm />
        <AccentColorPicker />
      </>
    );
  }

  return (
    <>
      <Dashboard />
      <AccentColorPicker />
    </>
  );
}

