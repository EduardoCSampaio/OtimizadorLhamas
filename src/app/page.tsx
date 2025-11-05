"use client"

import { useState } from 'react';
import Header from '@/components/layout/header';
import DataExtractor from '@/components/data-extractor';
import BankProposalView from '@/components/bank-proposal-view';
import PriorityTasks from '@/components/priority-tasks';
import ActivityLog from '@/components/activity-log';
import type { Proposal } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [step, setStep] = useState(0);

  const handleDataExtracted = (data: Proposal) => {
    setProposal(data);
    setStep(1);
  };
  
  const handleReset = () => {
    setProposal(null);
    setStep(0);
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-5">
            {step === 0 && <DataExtractor onDataExtracted={handleDataExtracted} />}
            {step === 1 && proposal && <BankProposalView proposal={proposal} />}
            {step === 1 && (
               <Card>
                <CardHeader>
                  <CardTitle>Ações da Proposta</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleReset}>Iniciar Nova Proposta</Button>
                </CardContent>
              </Card>
            )}
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
