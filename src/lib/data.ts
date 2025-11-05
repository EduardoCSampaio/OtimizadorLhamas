import type { PriorityTask, Activity } from './types';
import { CheckCircle2, UserPlus, History } from 'lucide-react';

export const priorityTasks: PriorityTask[] = [
  { id: '1', title: 'Finalizar inserção BMG', client: 'Ana Silva', deadline: 'Hoje, 17:00', priority: 'Alta' },
  { id: '2', title: 'Verificar bancos pendentes', client: 'Carlos Souza', deadline: 'Amanhã, 12:00', priority: 'Média' },
  { id: '3', title: 'Ligar para cliente', client: 'Mariana Costa', deadline: '2 dias', priority: 'Baixa' },
];

export const activityLog: Activity[] = [
    { id: '1', icon: CheckCircle2, description: 'Proposta para João Pereira inserida no Itaú.', timestamp: '2 min atrás' },
    { id: '2', icon: CheckCircle2, description: 'Proposta de Ana Silva concluída no Bradesco.', timestamp: '1 hora atrás' },
    { id: '3', icon: UserPlus, description: 'Novo cliente cadastrado: Carlos Souza.', timestamp: '3 horas atrás' },
    { id: '4', icon: History, description: 'Reaberta inserção para a proposta de Mariana Costa no C6.', timestamp: 'ontem' },
];
