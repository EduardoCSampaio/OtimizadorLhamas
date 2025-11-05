'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useCollection, useFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import {
  CheckCircle2,
  UserPlus,
  History,
  LogIn,
  FilePenLine,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import type { Activity } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';
import { useMemoFirebase } from '@/firebase/provider';

const typeToIcon = {
  CREATE: PlusCircle,
  UPDATE: FilePenLine,
  DELETE: Trash2,
  LOGIN: LogIn,
  STATUS_CHANGE: CheckCircle2,
  REOPEN: History,
};

const ActivityIcon = ({ type }: { type: Activity['type'] | 'REOPEN' }) => {
  const Icon = typeToIcon[type] || FilePenLine;
  return <Icon className="h-4 w-4 text-muted-foreground" />;
};

export default function ActivityLog() {
  const { firestore } = useFirebase();

  const activityLogRef = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'activityLogs'),
            orderBy('timestamp', 'desc'),
            limit(10)
          )
        : null,
    [firestore]
  );

  const { data: activities, isLoading } =
    useCollection<Activity>(activityLogRef);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Atividades</CardTitle>
        <CardDescription>Ações recentes realizadas no sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="grid gap-1.5 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="bg-muted rounded-full p-2">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="grid gap-0.5 text-sm">
                    <p className="text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp
                        ? formatDistanceToNow(activity.timestamp.toDate(), {
                            addSuffix: true,
                            locale: ptBR,
                          })
                        : 'agora'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Nenhuma atividade registrada ainda.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
