import type { LucideIcon } from "lucide-react";
import type { Timestamp } from 'firebase/firestore';

export interface Proposal {
  clientName: string;
  cpf: string;
  loanAmount: number;
  email: string;
  phone: string;
}

export type BankCategory = 'CLT' | 'FGTS' | 'GOV' | 'INSS' | 'Sem Info' | 'Inserção';

// Represents a master bank entry
export interface BankMaster {
  id: string;
  name: string;
  logoUrl: string;
  categories: BankCategory[];
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
  description: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  bankName: string;
}

export interface Activity {
  id: string;
  description: string;
  timestamp: Timestamp;
  userEmail: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'STATUS_CHANGE' | 'REOPEN';
}

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    role: 'master' | 'user';
}
