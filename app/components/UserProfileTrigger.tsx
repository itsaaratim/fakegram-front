'use client';

import React from 'react';
import { useFakegram } from '../utils/store';

interface UserProfileTriggerProps {
  userId: string;
  className?: string;
  children: React.ReactNode;
}

export default function UserProfileTrigger({ userId, className = '', children }: UserProfileTriggerProps) {
  const { viewProfile } = useFakegram();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent trigger bleed-through (e.g. inside story clicks)
    viewProfile(userId);
  };

  return (
    <div 
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          viewProfile(userId);
        }
      }}
    >
      {children}
    </div>
  );
}
