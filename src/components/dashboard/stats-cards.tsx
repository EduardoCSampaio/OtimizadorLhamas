'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, ListTodo } from 'lucide-react';
import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp, orderBy } from 'firebase/firestore';
import type { BankChecklistStatus, BankMaster } from '@/lib/types';
import { differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

export default function StatsCards() {
  const { firestore, user } = useFirebase();

  // 1. Fetch all master banks to identify which ones are for "Inserção"
  const banksMasterCollectionRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'bankStatuses'), orderBy('name')) : null),
    [firestore]
  );
  const { data: masterBanks, isLoading: isLoadingMasterBanks } = useCollection<BankMaster>(banksMasterCollectionRef);

  // 2. Fetch the user's checklist data
  const userChecklistCollectionRef = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'users', user.uid, 'bankChecklists') : null),
    [firestore, user]
  );
  const { data: checklistItems, isLoading: isLoadingChecklist } = useCollection<BankChecklistStatus>(userChecklistCollectionRef);

  const stats = useMemo(() => {
    if (!checklistItems || !masterBanks) {
      return {
        completedToday: 0,
        pending: 0,
        alert: 0,
      };
    }

    // Create a Set of bank IDs that are marked for "Inserção"
    const insertionBankIds = new Set(
        masterBanks
            .filter(bank => Array.isArray(bank.categories) && bank.categories.includes('Inserção'))
            .map(bank => bank.id)
    );

    // Filter the user's checklist to only include items relevant to "Inserção"
    const relevantChecklistItems = checklistItems.filter(item => insertionBankIds.has(item.id));

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    let completedToday = 0;
    let pending = 0;
    let alert = 0;

    relevantChecklistItems.forEach(item => {
      // Completed Today
      if (item.status === 'Concluído' && item.insertionDate) {
        const insertionDate = item.insertionDate.toDate();
        if (insertionDate >= todayStart && insertionDate <= todayEnd) {
          completedToday++;
        }
      }

      // Pending
      if (item.status === 'Pendente') {
        pending++;
      }

      // Alert
      if (item.status === 'Concluído' && item.insertionDate) {
        const daysSinceUpdate = differenceInDays(new Date(), item.insertionDate.toDate());
        if (daysSinceUpdate >= 2) {
          alert++;
        }
      }
    });

    return { completedToday, pending, alert };
  }, [checklistItems, masterBanks]);

  const isLoading = isLoadingChecklist || isLoadingMasterBanks;

  const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: number, icon: React.ElementType, description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Skeleton className="h-8 w-1/2" />
        ) : (
            <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <StatCard
        title="Concluído Hoje"
        value={stats.completedToday}
        icon={CheckCircle2}
        description="Inserções marcadas como concluídas hoje."
      />
      <StatCard
        title="Pendentes"
        value={stats.pending}
        icon={ListTodo}
        description="Total de inserções aguardando conclusão."
      />
      <StatCard
        title="Em Alerta"
        value={stats.alert}
        icon={AlertTriangle}
        description="Concluídos há mais de 2 dias. Precisam de atenção."
      />
    </div>
  );
}
