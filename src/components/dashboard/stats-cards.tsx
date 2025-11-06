'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, ListTodo, Users } from 'lucide-react';
import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { BankChecklistStatus } from '@/lib/types';
import { differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

export default function StatsCards() {
  const { firestore, user } = useFirebase();

  const userChecklistCollectionRef = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'users', user.uid, 'bankChecklists') : null),
    [firestore, user]
  );
  
  const { data: checklistItems, isLoading } = useCollection<BankChecklistStatus>(userChecklistCollectionRef);

  const stats = useMemo(() => {
    if (!checklistItems) {
      return {
        completedToday: 0,
        pending: 0,
        alert: 0,
      };
    }

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    let completedToday = 0;
    let pending = 0;
    let alert = 0;

    checklistItems.forEach(item => {
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
  }, [checklistItems]);

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
