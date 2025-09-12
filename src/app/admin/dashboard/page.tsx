'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboardAliasPage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && authenticated && user?.is_admin) {
      router.replace('/admin');
    }
  }, [loading, authenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authenticated || !user?.is_admin) {
    return notFound();
  }

  return null;
}


