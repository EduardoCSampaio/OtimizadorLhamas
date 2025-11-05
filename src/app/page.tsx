"use client"

import Header from '@/components/layout/header';
import BankProposalView from '@/components/bank-proposal-view';
import PriorityTasks from '@/components/priority-tasks';
import ActivityLog from '@/components/activity-log';

export default function Home() {
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
