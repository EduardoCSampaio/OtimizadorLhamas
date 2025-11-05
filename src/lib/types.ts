<<<<<<< HEAD
'use client';

import type { LucideIcon } from 'lucide-react';
=======
import type { LucideIcon } from "lucide-react";
>>>>>>> 0af121b (File changes)
import type { Timestamp } from 'firebase/firestore';

export interface Proposal {
  clientName: string;
  cpf: string;
  loanAmount: number;
  email: string;
  phone: string;
}

<<<<<<< HEAD
export type BankCategory = 'CLT' | 'FGTS' | 'GOV' | 'INSS' | 'Sem Info' | 'Inserção';
=======
export type BankCategory = 'Qualibanking' | 'Credfranco' | 'Daycoval' | 'Facta' | 'C6' | 'Custom';
>>>>>>> 226043a (Ok, faz uma parte escrita "Adicionar Banco" irei adicionar um por um, po)

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
  categories: BankCategory[];
  promotoraId?: string; // Optional: ID of the associated Promotora
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Represents the user-specific checklist status for a bank
export interface BankChecklistStatus {
  id: string; // This ID should correspond to the BankMaster ID
  status: 'Pendente' | 'Concluído';
<<<<<<< HEAD
  insertionDate: Timestamp | null;
  updatedAt: Timestamp;
}

export interface CLTRule {
  id: string;
  ruleName: string;
  ruleValue: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
=======
  insertionDate?: Date;
  priority: 'Alta' | 'Média' | 'Baixa';
>>>>>>> 6585a1e (Prioridades:)
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

// Represents the user-specific, private access details for a bank
export interface BankAccessDetails {
  id: string; // This ID should correspond to the BankMaster ID
  bankId: string;
  link?: string;
  logins?: LoginCredential[];
  updatedAt: Timestamp;
}
