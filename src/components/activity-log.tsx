import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
  } from '@/components/ui/card';
  import { activityLog } from '@/lib/data';
  
  export default function ActivityLog() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registro de Atividades</CardTitle>
          <CardDescription>Ações recentes realizadas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLog.map(activity => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="bg-muted rounded-full p-2">
                    <activity.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="grid gap-0.5">
                  <p className="text-sm text-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  