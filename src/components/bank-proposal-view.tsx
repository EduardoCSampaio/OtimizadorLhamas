"use client";

<<<<<<< HEAD
import { useState, useEffect, useMemo } from 'react';
=======
import { useState, useEffect } from 'react';
>>>>>>> 843f2ba (Será que é possível fazer uma parte aonde terá as logos dos bancos? Ai c)
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
<<<<<<< HEAD
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BankChecklistStatus, BankMaster, BankCategory, UserProfile } from '@/lib/types';
import { CheckCircle, History, Landmark, RefreshCw } from 'lucide-react';
=======
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
<<<<<<< HEAD
import type { BankChecklistStatus, BankMaster } from '@/lib/types';
<<<<<<< HEAD
import { CheckCircle, History, Landmark, PlusCircle } from 'lucide-react';
>>>>>>> 226043a (Ok, faz uma parte escrita "Adicionar Banco" irei adicionar um por um, po)
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCollection, useFirebase, useUser } from '@/firebase';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { collection, doc, getDoc, getDocs, serverTimestamp, writeBatch, query, orderBy, where } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useMemoFirebase } from '@/firebase/provider';
import { createActivityLog } from '@/firebase/user-data';
import { Skeleton } from './ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type CombinedBankStatus = BankMaster & BankChecklistStatus & { priority: 'Alta' | 'Média' | 'Baixa' };

export default function BankProposalView() {
  const { toast } = useToast();
<<<<<<< HEAD
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [userRole, setUserRole] = useState<'master' | 'user' | null>(null);
  
  const banksMasterCollectionRef = useMemoFirebase(
      () => (firestore ? query(collection(firestore, 'bankStatuses'), orderBy('name')) : null),
      [firestore]
  );
  const { data: masterBanks, isLoading: isLoadingMasterBanks } = useCollection<BankMaster>(banksMasterCollectionRef);

  const userChecklistCollectionRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return collection(firestore, 'users', user.uid, 'bankChecklists');
  }, [firestore, user]);
  const { data: userChecklist, isLoading: isLoadingChecklist } = useCollection<BankChecklistStatus>(userChecklistCollectionRef);

  const [combinedBankData, setCombinedBankData] = useState<CombinedBankStatus[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  // Fetch user role
  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
=======
  const [bankStatuses, setBankStatuses] = useState<BankStatus[]>([]);
=======
import { collection, doc, serverTimestamp } from 'firebase/firestore';
=======
=======
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
=======
import { Checkbox } from '@/components/ui/checkbox';
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
import type { BankChecklistStatus, BankMaster, BankCategory } from '@/lib/types';
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)
import { CheckCircle, History, Landmark, PlusCircle, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCollection, useFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch, getDocs, query, where, addDoc, orderBy, updateDoc, runTransaction } from 'firebase/firestore';
>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
=======
import { collection, doc, serverTimestamp, writeBatch, getDocs, query, where } from 'firebase/firestore';
=======
import { collection, doc, serverTimestamp, writeBatch, getDocs, query, where, addDoc } from 'firebase/firestore';
>>>>>>> deacb7a (Os bancos não estão ficando salvos, poderia corrigir para mim?)
=======
import { collection, doc, serverTimestamp, writeBatch, getDocs, query, where, addDoc, orderBy } from 'firebase/firestore';
<<<<<<< HEAD
>>>>>>> 73e0d8b (E poderia também manter os bancos em ordem alfabetica sempre?)
import { addDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
=======
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
>>>>>>> 843f2ba (Será que é possível fazer uma parte aonde terá as logos dos bancos? Ai c)
import { useMemoFirebase } from '@/firebase/provider';
import EditBankModal from './edit-bank-modal';

type CombinedBankStatus = BankMaster & BankChecklistStatus & { priority: 'Alta' | 'Média' | 'Baixa' };
const allCategories: BankCategory[] = ['CLT', 'FGTS', 'GOV', 'INSS', 'Sem Info'];

export default function BankProposalView() {
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

<<<<<<< HEAD
  const bankStatusesCollectionRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return collection(firestore, 'users', user.uid, 'bankStatuses');
  }, [firestore, user]);

  const { data: bankStatuses, isLoading } = useCollection<BankStatusDocument>(bankStatusesCollectionRef);
>>>>>>> 0af121b (File changes)
=======
  // --- State and Refs ---
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
  const [newBankName, setNewBankName] = useState('');
  const [newBankLogoUrl, setNewBankLogoUrl] = useState('');
  const [newBankCategories, setNewBankCategories] = useState<BankCategory[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankMaster | null>(null);

  // User role
  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc(userProfileRef);
  const isMaster = userProfile?.role === 'master';

  // Master list of all banks, ordered by name
  const banksMasterCollectionRef = useMemoFirebase(
      () => (firestore ? query(collection(firestore, 'bankStatuses'), orderBy('name')) : null),
      [firestore]
  );
  const { data: masterBanks, isLoading: isLoadingMasterBanks } = useCollection<BankMaster>(banksMasterCollectionRef);

  // User-specific checklist statuses
  const userChecklistCollectionRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return collection(firestore, 'users', user.uid, 'bankChecklists');
  }, [firestore, user]);
  const { data: userChecklist, isLoading: isLoadingChecklist } = useCollection<BankChecklistStatus>(userChecklistCollectionRef);

  const [combinedBankData, setCombinedBankData] = useState<CombinedBankStatus[]>([]);

  // --- Effects ---
  // Effect to create checklist items for new banks
  useEffect(() => {
    if (!firestore || !user || !masterBanks || !userChecklist) return;

    const checklistIds = new Set(userChecklist.map(item => item.id));
    const banksToAdd = masterBanks.filter(bank => !checklistIds.has(bank.id));

    if (banksToAdd.length > 0) {
        const batch = writeBatch(firestore);
        banksToAdd.forEach(bank => {
            const checklistRef = doc(firestore, 'users', user.uid, 'bankChecklists', bank.id);
            const newChecklistItem: Omit<BankChecklistStatus, 'id'> = {
                status: 'Pendente',
                insertionDate: null,
                updatedAt: serverTimestamp()
            };
            batch.set(checklistRef, newChecklistItem);
        });
        batch.commit().catch(error => console.error("Error adding new banks to user checklist:", error));
    }
  }, [masterBanks, userChecklist, firestore, user]);

  // Effect to combine master bank list with user checklist
  useEffect(() => {
      if (isLoadingMasterBanks || isLoadingChecklist || !masterBanks) {
          setCombinedBankData([]);
          return;
      }
      
      const checklistMap = new Map(userChecklist?.map(item => [item.id, item]));
      
      const combined = masterBanks.map(bank => {
          const checklistStatus = checklistMap.get(bank.id);
          const status = checklistStatus?.status || 'Pendente';
          const insertionDate = checklistStatus?.insertionDate || null;
          const updatedAt = checklistStatus?.updatedAt || bank.updatedAt;

          return {
              ...bank, // master bank data
              ...checklistStatus, // user checklist data
              id: bank.id, // ensure master id is used
              status: status,
              insertionDate: insertionDate,
              updatedAt: updatedAt,
              priority: calculatePriority(status, insertionDate)
          };
      });

      combined.sort((a, b) => a.name.localeCompare(b.name));
      setCombinedBankData(combined);

  }, [masterBanks, userChecklist, isLoadingMasterBanks, isLoadingChecklist]);


  // --- Helper Functions ---
  const calculatePriority = (status: 'Pendente' | 'Concluído', insertionDate: any): 'Alta' | 'Média' | 'Baixa' => {
      if (status === 'Pendente' || !insertionDate) {
        return 'Média'; 
      }
      const date = insertionDate.toDate ? insertionDate.toDate() : new Date();
      const daysSinceUpdate = differenceInDays(new Date(), date);

      if (daysSinceUpdate >= 2) return 'Alta';
      if (daysSinceUpdate >= 1) return 'Média';
      return 'Baixa';
  };

  const getPriorityBadgeVariant = (priority: 'Alta' | 'Média' | 'Baixa') => {
    switch (priority) {
      case 'Alta': return 'destructive';
      case 'Média': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryBadgeVariant = (category: BankCategory) => {
    switch (category) {
      case 'CLT': return 'default';
      case 'FGTS': return 'secondary';
      case 'GOV': return 'outline';
      case 'INSS': return 'destructive';
      default: return 'secondary';
    }
  };


  const renderStatus = (status: CombinedBankStatus) => {
    const insertionDate = status.insertionDate ? status.insertionDate.toDate() : null;
    switch(status.status) {
        case 'Pendente': 
            return <Badge variant="outline">Pendente</Badge>;
        case 'Concluído': 
            return (
                <div className="flex flex-col">
                    <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-3 w-3"/>Concluído</Badge>
                    {insertionDate && <span className="text-xs text-muted-foreground mt-1">{format(insertionDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>}
                </div>
            );
    }
  }


  // --- Event Handlers ---

  const handleNewCategoryChange = (category: BankCategory) => {
    setNewBankCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddBank = async () => {
    if (newBankName.trim() === '') {
        toast({ variant: 'destructive', title: 'Erro', description: 'O nome do banco não pode estar vazio.' });
        return;
    }
     if (newBankCategories.length === 0) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Selecione pelo menos uma categoria.' });
        return;
    }
    if (!firestore) return;

    const masterBankCollection = collection(firestore, 'bankStatuses');
    const q = query(masterBankCollection, where("name", "==", newBankName.trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Este banco já existe.' });
        return;
    }

    const newBankData: Omit<BankMaster, 'id'> = {
      name: newBankName.trim(),
      logoUrl: newBankLogoUrl.trim(),
      categories: newBankCategories,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(masterBankCollection, newBankData);

    setNewBankName('');
    setNewBankLogoUrl('');
    setNewBankCategories([]);
    toast({ title: 'Banco Adicionado!', description: `O banco ${newBankName} foi adicionado com sucesso.` });
  };

  const handleToggleStatus = (bankId: string) => {
<<<<<<< HEAD
    setBankStatuses(prev =>
      prev.map(b => {
        if (b.id === bankId) {
          const isCompleted = b.status === 'Concluído';
          const newStatus = isCompleted ? 'Pendente' : 'Concluído';
          const newDate = new Date();
          
          toast({
              title: `Status Alterado!`,
              description: `A inserção no banco ${b.name} foi marcada como ${newStatus.toLowerCase()}.`,
          });
<<<<<<< HEAD

          return { ...b, status: newStatus, insertionDate: newDate };
>>>>>>> 226043a (Ok, faz uma parte escrita "Adicionar Banco" irei adicionar um por um, po)
=======
          
          const updatedBank = { ...b, status: newStatus, insertionDate: newDate };
          return { ...updatedBank, priority: calculatePriority(updatedBank) };
>>>>>>> 6585a1e (Prioridades:)
        }
      });
    }
  }, [user, firestore]);

  // Effect to create checklist items for new banks
  useEffect(() => {
    if (!firestore || !user || !masterBanks || !userChecklist) return;

    const checklistIds = new Set(userChecklist.map(item => item.id));
    const banksToAdd = masterBanks.filter(bank => !checklistIds.has(bank.id));

    if (banksToAdd.length > 0) {
        const batch = writeBatch(firestore);
        banksToAdd.forEach(bank => {
            const checklistRef = doc(firestore, 'users', user.uid, 'bankChecklists', bank.id);
            const newChecklistItem: Omit<BankChecklistStatus, 'id'> = {
                status: 'Pendente',
                insertionDate: null,
                updatedAt: serverTimestamp()
            };
            batch.set(checklistRef, newChecklistItem);
        });
        batch.commit().catch(error => console.error("Error adding new banks to user checklist:", error));
    }
  }, [masterBanks, userChecklist, firestore, user]);

  // Effect to combine master bank list with user checklist, filtering for "Inserção"
  useEffect(() => {
      if (isLoadingMasterBanks || isLoadingChecklist || !masterBanks) {
          setCombinedBankData([]);
          return;
      }
      
      const checklistMap = new Map(userChecklist?.map(item => [item.id, item]));

      const insertionBanks = masterBanks.filter(bank => Array.isArray(bank.categories) && bank.categories.includes('Inserção'));
      
      const combined = insertionBanks.map(bank => {
          const checklistStatus = checklistMap.get(bank.id);
          const status = checklistStatus?.status || 'Pendente';
          const insertionDate = checklistStatus?.insertionDate || null;
          const updatedAt = checklistStatus?.updatedAt || bank.updatedAt;

          return {
              ...bank,
              ...checklistStatus,
              id: bank.id, 
              status: status,
              insertionDate: insertionDate,
              updatedAt: updatedAt,
              priority: calculatePriority(status, insertionDate)
          };
      });

      combined.sort((a, b) => a.name.localeCompare(b.name));
      setCombinedBankData(combined);

  }, [masterBanks, userChecklist, isLoadingMasterBanks, isLoadingChecklist]);


  const calculatePriority = (status: 'Pendente' | 'Concluído', insertionDate: any): 'Alta' | 'Média' | 'Baixa' => {
      if (status === 'Pendente' || !insertionDate) {
        return 'Média'; 
      }
      const date = insertionDate.toDate ? insertionDate.toDate() : new Date();
      const daysSinceUpdate = differenceInDays(new Date(), date);

      if (daysSinceUpdate >= 2) return 'Alta';
      if (daysSinceUpdate >= 1) return 'Média';
      return 'Baixa';
=======
    if (!user || !firestore) return;
    
    const bankDocRef = doc(firestore, 'users', user.uid, 'bankChecklists', bankId);
    const currentBank = combinedBankData.find(b => b.id === bankId);
    if (!currentBank) return;

    const isCompleted = currentBank.status === 'Concluído';
    const newStatus = isCompleted ? 'Pendente' : 'Concluído';
    const newInsertionDate = newStatus === 'Concluído' ? serverTimestamp() : null;
    
    updateDocumentNonBlocking(bankDocRef, {
        status: newStatus,
        insertionDate: newInsertionDate,
        updatedAt: serverTimestamp()
    });

    toast({
        title: `Status Alterado!`,
        description: `A inserção no banco ${currentBank.name} foi marcada como ${newStatus.toLowerCase()}.`,
    });
>>>>>>> 0af121b (File changes)
  };
<<<<<<< HEAD
<<<<<<< HEAD

  const getPriorityBadgeVariant = (priority: 'Alta' | 'Média' | 'Baixa') => {
    switch (priority) {
      case 'Alta': return 'destructive';
      case 'Média': return 'secondary';
      default: return 'outline';
    }
  };

<<<<<<< HEAD
  const getCategoryBadgeVariant = (category: BankCategory) => {
    switch (category) {
      case 'CLT': return 'default';
      case 'FGTS': return 'secondary';
      case 'GOV': return 'outline';
      case 'INSS': return 'destructive';
      case 'Inserção': return 'default';
      default: return 'secondary';
    }
  };


  const renderStatus = (status: CombinedBankStatus) => {
=======
  const renderStatus = (status: BankStatusDocument) => {
>>>>>>> 0af121b (File changes)
    const insertionDate = status.insertionDate ? status.insertionDate.toDate() : null;
    switch(status.status) {
        case 'Pendente': 
            return <Badge variant="outline">Pendente</Badge>;
        case 'Concluído': 
            return (
                <div className="flex flex-col">
                    <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-3 w-3"/>Concluído</Badge>
<<<<<<< HEAD
<<<<<<< HEAD
                    {insertionDate && <span className="text-xs text-muted-foreground mt-1">{format(insertionDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>}
=======
                    {status.insertionDate && <span className="text-xs text-muted-foreground mt-1">{format(status.insertionDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>}
>>>>>>> 6585a1e (Prioridades:)
=======
                    {insertionDate && <span className="text-xs text-muted-foreground mt-1">{format(insertionDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>}
>>>>>>> 0af121b (File changes)
                </div>
            );
    }
  }
=======
  
<<<<<<< HEAD
  const isLoading = isUserLoading || isLoadingMasterBanks || isLoadingChecklist;
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
=======
  const isLoading = isLoadingMasterBanks || isLoadingChecklist;
>>>>>>> 843f2ba (Será que é possível fazer uma parte aonde terá as logos dos bancos? Ai c)

<<<<<<< HEAD
  const handleToggleStatus = (bankId: string) => {
    if (!user || !firestore) return;
    
    const bankDocRef = doc(firestore, 'users', user.uid, 'bankChecklists', bankId);
    const currentBank = combinedBankData.find(b => b.id === bankId);
    if (!currentBank) return;

    const isCompleted = currentBank.status === 'Concluído';
    const newStatus = isCompleted ? 'Pendente' : 'Concluído';
    const newInsertionDate = newStatus === 'Concluído' ? serverTimestamp() : null;
    
    updateDocumentNonBlocking(bankDocRef, {
        status: newStatus,
        insertionDate: newInsertionDate,
        updatedAt: serverTimestamp()
    });

    createActivityLog(firestore, user.email || 'unknown', {
        type: newStatus === 'Concluído' ? 'STATUS_CHANGE' : 'REOPEN',
        description: `Alterou o status de ${currentBank.name} para ${newStatus}`
    });

    toast({
        title: `Status Alterado!`,
        description: `A inserção no banco ${currentBank.name} foi marcada como ${newStatus.toLowerCase()}.`,
    });
  };

  const handleResetChecklist = async () => {
    if (!firestore || !user) return;
    setIsResetting(true);

    try {
        const usersRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const batch = writeBatch(firestore);

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const checklistRef = collection(firestore, 'users', userId, 'bankChecklists');
            const checklistQuery = query(checklistRef, where('status', '==', 'Concluído'));
            const checklistSnapshot = await getDocs(checklistQuery);

            checklistSnapshot.forEach(checkDoc => {
                const docRef = doc(firestore, 'users', userId, 'bankChecklists', checkDoc.id);
                batch.update(docRef, {
                    status: 'Pendente',
                    insertionDate: null,
                    updatedAt: serverTimestamp()
                });
            });
        }
        await batch.commit();

        createActivityLog(firestore, user.email || 'unknown', {
            type: 'REOPEN',
            description: `Reiniciou o checklist diário para todos os usuários.`
        });

        toast({
            title: 'Checklist Reiniciado!',
            description: 'Todos os itens concluídos foram redefinidos para "Pendente".'
        });

    } catch (error) {
        console.error("Failed to reset checklist:", error);
        toast({
            variant: 'destructive',
            title: 'Falha ao Reiniciar',
            description: 'Ocorreu um erro ao reiniciar o checklist.'
        });
    } finally {
        setIsResetting(false);
    }
  }
=======

  const handleOpenEditModal = (bank: BankMaster) => {
    setSelectedBank(bank);
    setIsEditModalOpen(true);
  };
>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
  
  const handleUpdateBank = async (updatedData: { name: string; logoUrl: string, categories: BankCategory[] }) => {
    if (!firestore || !selectedBank) return;
  
    const bankMasterRef = doc(firestore, 'bankStatuses', selectedBank.id);
  
    try {
      await updateDoc(bankMasterRef, {
        name: updatedData.name,
        logoUrl: updatedData.logoUrl,
        categories: updatedData.categories,
        updatedAt: serverTimestamp()
      });
  
      toast({
        title: 'Banco Atualizado!',
        description: `O banco ${updatedData.name} foi atualizado com sucesso.`,
      });
      setIsEditModalOpen(false);
      setSelectedBank(null);
    } catch (error) {
      console.error('Error updating bank:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o banco.',
      });
    }
  };

  const isLoading = isLoadingMasterBanks || isLoadingChecklist;

  return (
    <>
<<<<<<< HEAD
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Checklist Diário de Inserções</CardTitle>
                <CardDescription className="mt-2">
                    Controle diário da inserção de propostas nos sistemas bancários. Apenas bancos marcados com a categoria "Inserção" são exibidos aqui.
                </CardDescription>
              </div>
              {userRole === 'master' && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" disabled={isResetting}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                        {isResetting ? 'Reiniciando...' : 'Reiniciar Checklist'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá redefinir o status de **todos** os bancos "Concluído" para "Pendente" para **todos os usuários**. Isso não pode ser desfeito.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetChecklist}>Continuar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && 
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          }
          {!isLoading && combinedBankData.length > 0 ? (
=======
  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Banco</CardTitle>
          <CardDescription>
            Insira os detalhes do banco para adicioná-lo à lista de checklist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Nome do Banco</Label>
                <Input 
                  id="bank-name"
                  type="text" 
                  placeholder="Ex: Banco do Brasil" 
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-logo">URL da Logo</Label>
                <Input 
                  id="bank-logo"
                  type="text" 
                  placeholder="https://.../logo.png" 
                  value={newBankLogoUrl}
                  onChange={(e) => setNewBankLogoUrl(e.target.value)}
                />
              </div>
          </div>
           <div className="mt-4">
              <Button onClick={handleAddBank}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Banco
              </Button>
=======
      {isMaster && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Adicionar Banco</CardTitle>
            <CardDescription>
              Insira os detalhes do banco para adicioná-lo à lista de checklist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Nome do Banco</Label>
                      <Input 
                        id="bank-name"
                        type="text" 
                        placeholder="Ex: Banco do Brasil" 
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank-logo">URL da Logo</Label>
                      <Input 
                        id="bank-logo"
                        type="text" 
                        placeholder="https://.../logo.png" 
                        value={newBankLogoUrl}
                        onChange={(e) => setNewBankLogoUrl(e.target.value)}
                      />
                    </div>
                </div>
<<<<<<< HEAD
                <div className="space-y-2">
                  <Label htmlFor="bank-logo">URL da Logo</Label>
                  <Input 
                    id="bank-logo"
                    type="text" 
                    placeholder="https://.../logo.png" 
                    value={newBankLogoUrl}
                    onChange={(e) => setNewBankLogoUrl(e.target.value)}
                  />
                </div>
<<<<<<< HEAD
>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
=======
                <div className="space-y-2">
                  <Label htmlFor="bank-category">Categoria</Label>
                  <Select value={newBankCategory} onValueChange={(value: BankCategory) => setNewBankCategory(value)}>
                      <SelectTrigger id="bank-category">
                          <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                          {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
=======
                <div className="space-y-4">
                   <div className="space-y-2">
                     <Label>Categorias</Label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-2 border rounded-md">
                        {allCategories.map(cat => (
                            <div key={cat} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`new-cat-${cat}`}
                                    checked={newBankCategories.includes(cat)}
                                    onCheckedChange={() => handleNewCategoryChange(cat)}
                                />
                                <Label htmlFor={`new-cat-${cat}`} className="font-normal">{cat}</Label>
                            </div>
                        ))}
                     </div>
                   </div>
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
                </div>
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)
            </div>
             <div className="mt-6">
                <Button onClick={handleAddBank}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Banco
                </Button>
              </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Checklist Diário de Inserções</CardTitle>
          <CardDescription>
            Controle diário da inserção de propostas nos sistemas bancários.
          </CardDescription>
        </CardHeader>
        <CardContent>
<<<<<<< HEAD
<<<<<<< HEAD
          {bankStatuses.length > 0 ? (
>>>>>>> 226043a (Ok, faz uma parte escrita "Adicionar Banco" irei adicionar um por um, po)
=======
          {isLoading && <p>Carregando bancos...</p>}
          {!isLoading && bankStatuses && bankStatuses.length > 0 ? (
>>>>>>> 0af121b (File changes)
=======
          {isLoading && <p>Carregando checklist...</p>}
          {!isLoading && combinedBankData.length > 0 ? (
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                  <TableHead>Outras Categorias</TableHead>
=======
>>>>>>> 226043a (Ok, faz uma parte escrita "Adicionar Banco" irei adicionar um por um, po)
=======
                  <TableHead>Categoria</TableHead>
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)
=======
                  <TableHead>Categorias</TableHead>
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
                  <TableHead>Status e Data da Última Atualização</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                {combinedBankData.map(bank => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {bank.logoUrl ? (
                          <Image src={bank.logoUrl} alt={`${bank.name} logo`} width={24} height={24} className="h-6 w-6 object-contain"/>
                        ) : (
                          <Landmark className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span>{bank.name}</span>
                      </div>
<<<<<<< HEAD
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {bank.categories?.filter(c => c !== 'Inserção').map(cat => (
                          <Badge key={cat} variant={getCategoryBadgeVariant(cat)}>{cat}</Badge>
                        ))}
                      </div>
=======
                {bankStatuses.map(bank => (
=======
                {sortedBankStatuses?.map(bank => (
>>>>>>> 0af121b (File changes)
=======
                {combinedBankData.map(bank => (
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-muted-foreground" />
                      {bank.name}
>>>>>>> 226043a (Ok, faz uma parte escrita "Adicionar Banco" irei adicionar um por um, po)
=======
>>>>>>> 843f2ba (Será que é possível fazer uma parte aonde terá as logos dos bancos? Ai c)
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {bank.categories?.map(cat => (
                          <Badge key={cat} variant={getCategoryBadgeVariant(cat)}>{cat}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{renderStatus(bank)}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(bank.priority)}>{bank.priority}</Badge>
                    </TableCell>
<<<<<<< HEAD
<<<<<<< HEAD
                    <TableCell className="text-right space-x-2">
=======
                    <TableCell className="text-right">
>>>>>>> 226043a (Ok, faz uma parte escrita "Adicionar Banco" irei adicionar um por um, po)
=======
                    <TableCell className="text-right space-x-2">
>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
                      <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleStatus(bank.id)}
                      >
                        {bank.status === 'Pendente' ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2"/>
                            Concluir
                          </>
                        ) : (
                          <>
                            <History className="h-4 w-4 mr-2"/>
                            Reabrir
                          </>
                        )}
                      </Button>
                      {isMaster && (
                          <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleOpenEditModal(bank)}
                              className="h-8 w-8"
                          >
                              <Edit className="h-4 w-4"/>
                              <span className="sr-only">Editar Banco</span>
                          </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            !isLoading && <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco de inserção encontrado. Vá para a página 'Bancos' para adicionar bancos e marcá-los com a categoria "Inserção".</p>
=======
            <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco adicionado ainda. Comece adicionando um acima.</p>
>>>>>>> 226043a (Ok, faz uma parte escrita "Adicionar Banco" irei adicionar um por um, po)
=======
            !isLoading && <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco adicionado ainda. Comece adicionando um acima.</p>
>>>>>>> 0af121b (File changes)
=======
            !isLoading && <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco adicionado ao sistema ainda. Comece adicionando um acima.</p>
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
          )}
        </CardContent>
      </Card>
      {selectedBank && (
        <EditBankModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          bank={selectedBank}
          onSave={handleUpdateBank}
        />
      )}
    </>
  );
}
