<<<<<<< HEAD
// This file is no longer in use, as data is now fetched dynamically from Firestore.
// It is kept for reference but can be safely removed in the future.
export {};
=======
import type { Bank, PriorityTask, Activity, BankCategory } from './types';
import { Landmark, FileClock, CheckCircle2, UserPlus, Send, History } from 'lucide-react';

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
>>>>>>> 72b0cd5 (Não é bem como deveria ser, teria que ter os bancos anotados, a data que)
