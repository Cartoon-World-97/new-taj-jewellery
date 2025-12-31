'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:ml-64 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
