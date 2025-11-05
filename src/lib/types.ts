import type { LucideIcon } from "lucide-react";
import type { Timestamp } from 'firebase/firestore';

export interface Proposal {
  clientName: string;
  cpf: string;
  loanAmount: number;
  email: string;
  phone: string;
}

export type BankCategory = 'CLT' | 'FGTS' | 'GOV' | 'INSS' | 'Custom';

// Represents a master bank entry
export interface BankMaster {
  id: string;
  name: string;
  logoUrl: string;
  category: BankCategory;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Represents the user-specific checklist status for a bank
export interface BankChecklistStatus {
  id: string; // This ID should correspond to the BankMaster ID
  status: 'Pendente' | 'Concluído';
  insertionDate: Timestamp | null;
  updatedAt: Timestamp;
}


export interface CLTRule {
  id: string;
  ruleName: string;
  ruleValue: string;
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
