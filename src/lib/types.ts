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
<<<<<<< HEAD
export type BankCategory = 'CLT' | 'FGTS' | 'GOV' | 'INSS' | 'Sem Info' | 'Inserção';
=======
export type BankCategory = 'Qualibanking' | 'Credfranco' | 'Daycoval' | 'Facta' | 'C6' | 'Custom';
>>>>>>> 226043a (Ok, faz uma parte escrita "Adicionar Banco" irei adicionar um por um, po)

<<<<<<< HEAD
export interface Promotora {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
=======
export type BankCategory = 'CLT' | 'FGTS' | 'GOV' | 'INSS' | 'Custom';
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)

// Represents a master bank entry
export interface BankMaster {
  id: string;
  name: string;
<<<<<<< HEAD
<<<<<<< HEAD
  logoUrl: string;
  categories: BankCategory[];
<<<<<<< HEAD
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
=======
  logoUrl?: string;
>>>>>>> 843f2ba (Será que é possível fazer uma parte aonde terá as logos dos bancos? Ai c)
=======
  logoUrl: string;
>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
  category: BankCategory;
  status: 'Pendente' | 'Concluído';
  insertionDate: Timestamp | null;
=======
// Represents a master bank entry
export interface BankMaster {
  id: string;
  name: string;
  category: BankCategory;
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
=======
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
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
