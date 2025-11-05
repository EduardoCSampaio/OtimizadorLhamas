"use client"

<<<<<<< HEAD
import { useUser } from '@/firebase';
=======
import { useAuth, useFirebase, useUser } from '@/firebase';
>>>>>>> 0af121b (File changes)
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/header';
import BankProposalView from '@/components/bank-proposal-view';
import PriorityTasks from '@/components/priority-tasks';
import ActivityLog from '@/components/activity-log';
import { Skeleton } from '@/components/ui/skeleton';
<<<<<<< HEAD
=======
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
>>>>>>> 0af121b (File changes)

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
<<<<<<< HEAD
  
=======
  const { auth } = useFirebase();

>>>>>>> 0af121b (File changes)
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
<<<<<<< HEAD
=======
          <Skeleton className="h-32 w-full" />
>>>>>>> 0af121b (File changes)
          <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-5">
                <Skeleton className="h-[400px] w-full" />
            </div>
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-5">
            <BankProposalView />
          </div>
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <PriorityTasks />
            <ActivityLog />
          </div>
        </div>
      </main>
    </div>
  );
}
