'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BankChecklistStatus, BankMaster, PriorityTask } from '@/lib/types';
import { useCollection, useFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { useMemoFirebase } from '@/firebase/provider';

type CombinedBankStatus = BankMaster & BankChecklistStatus;

export default function PriorityTasks() {
  const { firestore, user } = useFirebase();

  const banksMasterCollectionRef = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'bankStatuses'), orderBy('name'))
        : null,
    [firestore]
  );
  const { data: masterBanks, isLoading: isLoadingMasterBanks } =
    useCollection<BankMaster>(banksMasterCollectionRef);

  const userChecklistCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'bankChecklists');
  }, [firestore, user]);
  const { data: userChecklist, isLoading: isLoadingChecklist } =
    useCollection<BankChecklistStatus>(userChecklistCollectionRef);

  const [priorityTasks, setPriorityTasks] = useState<PriorityTask[]>([]);
  
  useEffect(() => {
    if (!masterBanks || !userChecklist) {
      setPriorityTasks([]);
      return;
    }

    const checklistMap = new Map(userChecklist.map((item) => [item.id, item]));

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 15099d9 (Bancos que não estão na categoria inserção, não precisa aparecer em prio)
    // Filter for banks that are in the "Inserção" category first.
    const insertionBanks = masterBanks.filter(
        (bank) => Array.isArray(bank.categories) && bank.categories.includes('Inserção')
    );

    const tasks = insertionBanks
<<<<<<< HEAD
      .map((bank) => {
        const checklistStatus = checklistMap.get(bank.id);
        // If a bank is for insertion but not in the user's checklist yet, it won't be processed.
        // This is fine, as another useEffect in bank-proposal-view creates it.
        if (!checklistStatus) return null;
        
=======
    const tasks = masterBanks
      .map((bank) => {
        const checklistStatus = checklistMap.get(bank.id);
>>>>>>> ae954fa (Em prioridades ali, temos as prioridades dos bancos agora salvas, poderi)
=======
      .map((bank) => {
        const checklistStatus = checklistMap.get(bank.id);
        // If a bank is for insertion but not in the user's checklist yet, it won't be processed.
        // This is fine, as another useEffect in bank-proposal-view creates it.
        if (!checklistStatus) return null;
        
>>>>>>> 15099d9 (Bancos que não estão na categoria inserção, não precisa aparecer em prio)
        const status = checklistStatus?.status || 'Pendente';
        const insertionDate = checklistStatus?.insertionDate || null;
        
        const priority = calculatePriority(status, insertionDate);
        if (priority === 'Baixa') return null;

        return {
            id: bank.id,
            title: getTaskTitle(status, bank.name, insertionDate),
            description: getTaskDescription(status, insertionDate),
            priority: priority,
            bankName: bank.name
        };
      })
      .filter((task): task is PriorityTask => task !== null);
      
    tasks.sort((a, b) => {
        const priorityOrder = { 'Alta': 1, 'Média': 2, 'Baixa': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setPriorityTasks(tasks);

  }, [masterBanks, userChecklist]);


  const calculatePriority = (
    status: 'Pendente' | 'Concluído',
    insertionDate: any
  ): 'Alta' | 'Média' | 'Baixa' => {
<<<<<<< HEAD
<<<<<<< HEAD
    if (!insertionDate || status === 'Pendente') {
=======
    if (!insertionDate) {
>>>>>>> ae954fa (Em prioridades ali, temos as prioridades dos bancos agora salvas, poderi)
=======
    if (!insertionDate || status === 'Pendente') {
>>>>>>> 15099d9 (Bancos que não estão na categoria inserção, não precisa aparecer em prio)
      return 'Média'; // Pending tasks are medium priority
    }
    const date = insertionDate.toDate ? insertionDate.toDate() : new Date();
    const daysSinceUpdate = differenceInDays(new Date(), date);

    if (daysSinceUpdate >= 2) return 'Alta';
    if (daysSinceUpdate >= 1) return 'Média';
    return 'Baixa';
  };
  
  const getTaskTitle = (status: 'Pendente' | 'Concluído', bankName: string, insertionDate: any) => {
<<<<<<< HEAD
<<<<<<< HEAD
      if (status === 'Pendente') {
        return `Inserção pendente: ${bankName}`;
      }
=======
>>>>>>> ae954fa (Em prioridades ali, temos as prioridades dos bancos agora salvas, poderi)
=======
      if (status === 'Pendente') {
        return `Inserção pendente: ${bankName}`;
      }
>>>>>>> 15099d9 (Bancos que não estão na categoria inserção, não precisa aparecer em prio)
      const date = insertionDate?.toDate ? insertionDate.toDate() : new Date();
      const daysSinceUpdate = differenceInDays(new Date(), date);
      
      if (status === 'Concluído' && daysSinceUpdate >= 2) {
          return `Verificar inserção: ${bankName}`;
      }
<<<<<<< HEAD
<<<<<<< HEAD
      return `Inserção concluída: ${bankName}`;
=======
      return `Inserção pendente: ${bankName}`;
>>>>>>> ae954fa (Em prioridades ali, temos as prioridades dos bancos agora salvas, poderi)
=======
      return `Inserção concluída: ${bankName}`;
>>>>>>> 15099d9 (Bancos que não estão na categoria inserção, não precisa aparecer em prio)
  }

  const getTaskDescription = (status: 'Pendente' | 'Concluído', insertionDate: any) => {
    if (status === 'Pendente' || !insertionDate) {
      return 'Esta inserção ainda não foi concluída.';
    }
     const date = insertionDate.toDate ? insertionDate.toDate() : new Date();
     const daysSinceUpdate = differenceInDays(new Date(), date);

     if (daysSinceUpdate >= 2) return `Concluído há ${daysSinceUpdate} dias. Requer atenção.`;
     if (daysSinceUpdate >= 1) return `Concluído há ${daysSinceUpdate} dia.`;

     return 'Concluído hoje.'
  }

  const getPriorityBadgeVariant = (priority: 'Alta' | 'Média' | 'Baixa') => {
    switch (priority) {
      case 'Alta':
        return 'destructive';
      case 'Média':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isLoading = isLoadingMasterBanks || isLoadingChecklist;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prioridades</CardTitle>
        <CardDescription>
<<<<<<< HEAD
<<<<<<< HEAD
          Tarefas de inserção que requerem sua atenção.
=======
          Tarefas que requerem sua atenção imediata.
>>>>>>> ae954fa (Em prioridades ali, temos as prioridades dos bancos agora salvas, poderi)
=======
          Tarefas de inserção que requerem sua atenção.
>>>>>>> 15099d9 (Bancos que não estão na categoria inserção, não precisa aparecer em prio)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                 {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start justify-between gap-4">
                         <div className="flex items-center gap-3 flex-1">
                            <Skeleton className="h-2 w-2 rounded-full" />
                             <div className="grid gap-1.5 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                         </div>
                         <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                {priorityTasks.length > 0 ? (
                    priorityTasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-start justify-between gap-4"
                        >
                            <div className="flex items-center gap-3">
                            <span
                                className={`flex h-2 w-2 rounded-full ${
                                task.priority === 'Alta'
                                    ? 'bg-red-500'
<<<<<<< HEAD
<<<<<<< HEAD
                                    : 'bg-yellow-500'
=======
                                    : task.priority === 'Média'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
>>>>>>> ae954fa (Em prioridades ali, temos as prioridades dos bancos agora salvas, poderi)
=======
                                    : 'bg-yellow-500'
>>>>>>> 15099d9 (Bancos que não estão na categoria inserção, não precisa aparecer em prio)
                                }`}
                            />
                            <div className="grid gap-0.5">
                                <p className="font-medium text-sm">{task.title}</p>
                                <p className="text-xs text-muted-foreground">{task.description}</p>
                            </div>
                            </div>
                            <Badge
                                variant={getPriorityBadgeVariant(task.priority)}
                                className="text-xs"
                            >
                            {task.priority}
                            </Badge>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center">Nenhuma tarefa prioritária no momento.</p>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
