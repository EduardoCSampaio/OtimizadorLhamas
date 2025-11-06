'use client';

import { useEffect, useMemo } from 'react';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import type { BankChecklistStatus } from '@/lib/types';

const LAST_SUMMARY_KEY = 'lastDailySummaryDate';

export default function DailySummaryNotification() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const todayString = format(new Date(), 'yyyy-MM-dd');

  const { startOfYesterday, endOfYesterday } = useMemo(() => {
    const yesterday = subDays(new Date(), 1);
    return {
      startOfYesterday: startOfDay(yesterday),
      endOfYesterday: endOfDay(yesterday),
    };
  }, []);

  // Query for completions from yesterday
  const yesterdayCompletionsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'users', user.uid, 'bankChecklists'),
            where('lastCompletedAt', '>=', Timestamp.fromDate(startOfYesterday)),
            where('lastCompletedAt', '<=', Timestamp.fromDate(endOfYesterday))
          )
        : null,
    [firestore, user, startOfYesterday, endOfYesterday]
  );
  
  const { data: yesterdayCompletions, isLoading } = useCollection<BankChecklistStatus>(yesterdayCompletionsQuery);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    const lastSummaryDate = localStorage.getItem(LAST_SUMMARY_KEY);

    // Only show if it's a new day and we haven't shown the summary for today yet
    if (lastSummaryDate !== todayString) {
      // yesterdayCompletions will be null initially, then populated. We wait for it to be an array.
      if (yesterdayCompletions !== null) {
          const completedCount = yesterdayCompletions.length;
          let title = '';
          let description = '';
    
          if (completedCount > 0) {
            title = `Resumo de Ontem: ${completedCount} Inserção(ões) Concluída(s)! 🎉`;
            description = 'Excelente trabalho! Vamos com tudo para mais um dia produtivo. 🚀';
          } else {
            title = 'Bom Dia e Bom Trabalho! ☀️';
            description = 'Nenhuma inserção concluída registrada para ontem. Um novo dia, novas oportunidades!';
          }
    
          // Show the toast after a short delay to ensure the UI is ready
          setTimeout(() => {
            toast({
              title,
              description,
              duration: 10000, // Show for 10 seconds
            });
          }, 1500);
    
          // Mark that we've shown the summary for today
          localStorage.setItem(LAST_SUMMARY_KEY, todayString);
      }
    }
  }, [yesterdayCompletions, isLoading, todayString, toast, user]);

  // This component does not render anything
  return null;
}
