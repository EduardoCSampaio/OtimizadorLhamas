'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useUser, useFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BankChecklistStatus } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export default function CompletionsChart() {
  const { firestore, user } = useFirebase();

  const startOfLast7Days = useMemo(() => subDays(startOfDay(new Date()), 6), []);

  const userChecklistQueryRef = useMemo(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'users', user.uid, 'bankChecklists'),
            where('lastCompletedAt', '>=', Timestamp.fromDate(startOfLast7Days))
          )
        : null,
    [firestore, user, startOfLast7Days]
  );
  
  const { data: recentCompletions, isLoading } = useCollection<BankChecklistStatus>(userChecklistQueryRef);

  const chartData = useMemo(() => {
    const dataByDay: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dataByDay[date] = 0;
    }

    recentCompletions?.forEach(completion => {
      if (completion.lastCompletedAt) {
        const dateStr = format(completion.lastCompletedAt.toDate(), 'yyyy-MM-dd');
        if (dateStr in dataByDay) {
          dataByDay[dateStr] = (dataByDay[dateStr] || 0) + 1;
        }
      }
    });

    return Object.keys(dataByDay)
      .map(date => ({
        date,
        name: format(new Date(date), 'eee', { locale: ptBR }),
        completions: dataByDay[date],
      }))
      .reverse();

  }, [recentCompletions]);

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className='h-6 w-1/2' />
                <Skeleton className='h-4 w-3/4' />
            </CardHeader>
            <CardContent>
                <Skeleton className='h-[250px] w-full' />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtividade Semanal</CardTitle>
        <CardDescription>Número de inserções concluídas nos últimos 7 dias.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={30}
            />
            <Tooltip
                cursor={{ fill: 'hsl(var(--secondary))' }}
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                }}
                labelStyle={{ fontWeight: 'bold' }}
                formatter={(value: number) => [`${value} inserções`, 'Concluído']}
            />
            <Bar dataKey="completions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
