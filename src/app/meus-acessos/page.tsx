'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import BankAccessView from '@/components/bank-access-view';

export default function MeusAcessosPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (!isUserLoading) {
            if (!user) {
                router.push('/login');
            } else {
                setIsLoading(false);
            }
        }
    }, 500); // Add a small delay to prevent flash of loading/redirect

    return () => clearTimeout(timer);
  }, [user, isUserLoading, router]);

  if (isLoading || isUserLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:gap-8">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </main>
      </div>
    );
  }
  
  if (!user) return null; // Should be handled by useEffect redirect, but as a safeguard

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <BankAccessView />
      </main>
    </div>
  );
}
