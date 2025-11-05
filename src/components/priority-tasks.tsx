import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
  } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { priorityTasks } from '@/lib/data';
  
  export default function PriorityTasks() {

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
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prioridades</CardTitle>
          <CardDescription>Tarefas que requerem sua atenção imediata.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priorityTasks.map(task => (
              <div key={task.id} className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className={`flex h-2 w-2 rounded-full ${
                        task.priority === 'Alta' ? 'bg-red-500' 
                        : task.priority === 'Média' ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`} />
                    <div className="grid gap-0.5">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.client}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">{task.deadline}</p>
                    <Badge variant={getPriorityBadgeVariant(task.priority)} className="mt-1 text-xs">
                        {task.priority}
                    </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  