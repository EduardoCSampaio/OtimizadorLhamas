'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useUser, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BankChecklistStatus } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export default function CompletionsChart() {
  const { firestore, user } = useFirebase();

  // Defines the start date for the query (7 days ago).
  const startOfPeriod = useMemo(() => subDays(startOfDay(new Date()), 6), []);

  // Firebase query to get completions within the last 7 days.
  const userChecklistQueryRef = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'users', user.uid, 'bankChecklists'),
            where('lastCompletedAt', '>=', Timestamp.fromDate(startOfPeriod))
          )
        : null,
    [firestore, user, startOfPeriod]
  );
  
  const { data: recentCompletions, isLoading } = useCollection<BankChecklistStatus>(userChecklistQueryRef);

  const chartData = useMemo(() => {
    // 1. Create a data structure for the last 7 days, initialized to 0.
    const dataByDay: { [key: string]: { date: Date; completions: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      dataByDay[dateKey] = { date: date, completions: 0 };
    }

    // 2. Populate the structure with data from Firestore.
    recentCompletions?.forEach(completion => {
      if (completion.lastCompletedAt) {
        const dateKey = format(completion.lastCompletedAt.toDate(), 'yyyy-MM-dd');
        if (dataByDay[dateKey]) {
          dataByDay[dateKey].completions++;
        }
      }
    });

    // 3. Convert to an array and format for the chart.
    return Object.values(dataByDay).map(dayData => ({
      date: format(dayData.date, 'yyyy-MM-dd'),
      name: format(dayData.date, 'eee', { locale: ptBR }),
      completions: dayData.completions,
    }));

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
