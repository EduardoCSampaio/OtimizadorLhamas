'use client';

import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export interface Proposal {
  clientName: string;
  cpf: string;
  loanAmount: number;
  email: string;
  phone: string;
}

export type BankCategory = 'CLT' | 'FGTS' | 'GOV' | 'INSS' | 'Sem Info' | 'Inserção';

export interface Promotora {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Represents a master bank entry
export interface BankMaster {
  id: string;
  name: string;
  logoUrl: string;
  customId?: string;
  categories: BankCategory[];
  promotoraId?: string; // Optional: ID of the associated Promotora
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Represents the user-specific checklist status for a bank
export interface BankChecklistStatus {
  id: string; // This ID should correspond to the BankMaster ID
  status: 'Pendente' | 'Concluído';
  insertionDate: Timestamp | null; // When it was last marked as 'Concluído' for the current cycle
  lastCompletedAt?: Timestamp | null; // Stores the date of the absolute last completion, never cleared.
  reopenedAt?: Timestamp | null; // Stores the date it was last reopened
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

export interface LoginCredential {
  type: string;
  username: string;
  password?: string;
}

// Represents the user-specific, private access details for a bank OR a promotora
export interface AccessDetails {
  id: string; // This ID should correspond to the BankMaster or Promotora ID
  link?: string;
  logins?: LoginCredential[];
  requiresToken?: boolean;
  tokenResponsible?: string;
  isRobo?: boolean;
  roboResponsible?: string;
  updatedAt: Timestamp;
}

// Explicitly for banks, just an alias for clarity in some components
export type BankAccessDetails = AccessDetails & { bankId: string };
// Explicitly for promotoras
export type PromotoraAccessDetails = AccessDetails & { promotoraId: string };
