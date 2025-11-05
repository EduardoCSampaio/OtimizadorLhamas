import type { LucideIcon } from "lucide-react";

export interface Proposal {
  clientName: string;
  cpf: string;
  loanAmount: number;
  email: string;
  phone: string;
}

export type BankCategory = 'Qualibanking' | 'Credfranco' | 'Daycoval' | 'Facta' | 'C6';

export interface Bank {
  id: string;
  name: string;
  category: BankCategory;
  icon: LucideIcon;
}

export interface BankStatus extends Bank {
  status: 'Pendente' | 'Enviando...' | 'Enviado' | 'Aprovado' | 'Rejeitado';
  priority: 'Alta' | 'Média' | 'Baixa';
}

export interface PriorityTask {
  id: string;
  title: string;
  client: string;
  deadline: string;
  priority: 'Alta' | 'Média' | 'Baixa';
}

export interface Activity {
  id: string;
  icon: LucideIcon;
  description: string;
  timestamp: string;
}
