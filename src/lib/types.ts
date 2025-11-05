import type { LucideIcon } from "lucide-react";
import type { Timestamp } from 'firebase/firestore';

export interface Proposal {
  clientName: string;
  cpf: string;
  loanAmount: number;
  email: string;
  phone: string;
}

export type BankCategory = 'Qualibanking' | 'Credfranco' | 'Daycoval' | 'Facta' | 'C6' | 'Custom';

export interface Bank {
  id: string;
  name: string;
  category: BankCategory;
  icon: LucideIcon;
}

export interface BankStatus extends Bank {
  status: 'Pendente' | 'Concluído';
  insertionDate?: Date;
  priority: 'Alta' | 'Média' | 'Baixa';
}

export interface BankStatusDocument {
  id: string;
  name: string;
  category: BankCategory;
  status: 'Pendente' | 'Concluído';
  insertionDate: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
