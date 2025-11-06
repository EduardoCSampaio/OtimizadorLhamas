"use client"

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/header';
import BankProposalView from '@/components/bank-proposal-view';
import PriorityTasks from '@/components/priority-tasks';
import ActivityLog from '@/components/activity-log';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCards from '@/components/dashboard/stats-cards';
import CompletionsChart from '@/components/dashboard/completions-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Landmark } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  
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
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
             <Skeleton className="h-32 w-full" />
             <Skeleton className="h-32 w-full" />
             <Skeleton className="h-32 w-full" />
             <Skeleton className="h-32 w-full" />
          </div>
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
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
            <TabsTrigger value="dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
            </TabsTrigger>
            <TabsTrigger value="workbank">
                <Landmark className="mr-2 h-4 w-4" />
                Bancos Workbank
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            <div className="flex flex-col gap-4">
              <StatsCards />
              <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
                  <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-5">
                      <CompletionsChart />
                  </div>
                  <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                      <PriorityTasks />
                      <ActivityLog />
                  </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="workbank" className="mt-6">
              <BankProposalView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
