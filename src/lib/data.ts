import type { Bank, PriorityTask, Activity, BankCategory } from './types';
import { Landmark, FileClock, CheckCircle2, UserPlus, Send } from 'lucide-react';

export const bankCategories: BankCategory[] = ['Qualibanking', 'Credfranco', 'Daycoval', 'Facta', 'C6'];

export const banks: Bank[] = [
  { id: 'itau', name: 'Itaú', category: 'Qualibanking', icon: Landmark },
  { id: 'bradesco', name: 'Bradesco', category: 'Qualibanking', icon: Landmark },
  { id: 'bb', name: 'Banco do Brasil', category: 'Credfranco', icon: Landmark },
  { id: 'caixa', name: 'Caixa Econômica', category: 'Credfranco', icon: Landmark },
  { id: 'daycoval', name: 'Banco Daycoval', category: 'Daycoval', icon: Landmark },
  { id: 'facta', name: 'Facta Financeira', category: 'Facta', icon: Landmark },
  { id: 'c6', name: 'C6 Bank', category: 'C6', icon: Landmark },
];

export const priorityTasks: PriorityTask[] = [
  { id: '1', title: 'Finalizar proposta BMG', client: 'Ana Silva', deadline: 'Hoje, 17:00', priority: 'Alta' },
  { id: '2', title: 'Revisar documentos pendentes', client: 'Carlos Souza', deadline: 'Amanhã, 12:00', priority: 'Média' },
  { id: '3', title: 'Ligar para cliente', client: 'Mariana Costa', deadline: '2 dias', priority: 'Baixa' },
];

export const activityLog: Activity[] = [
    { id: '1', icon: Send, description: 'Proposta para João Pereira enviada para o Itaú.', timestamp: '2 min atrás' },
    { id: '2', icon: CheckCircle2, description: 'Proposta de Ana Silva aprovada no Bradesco.', timestamp: '1 hora atrás' },
    { id: '3', icon: UserPlus, description: 'Novo cliente cadastrado: Carlos Souza.', timestamp: '3 horas atrás' },
    { id: '4', icon: FileClock, description: 'Documentação pendente para a proposta de Mariana Costa.', timestamp: 'ontem' },
];
