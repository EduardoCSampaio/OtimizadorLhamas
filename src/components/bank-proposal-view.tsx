"use client";

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BankChecklistStatus, BankMaster } from '@/lib/types';
import { CheckCircle, History, Landmark, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCollection, useFirebase, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch, getDocs, query, where, addDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useMemoFirebase } from '@/firebase/provider';

type CombinedBankStatus = BankChecklistStatus & { priority: 'Alta' | 'Média' | 'Baixa' };

export default function BankProposalView() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();

  // --- State and Refs ---
  const [newBankName, setNewBankName] = useState('');

  // Master list of all banks
  const banksMasterCollectionRef = useMemoFirebase(
      () => (firestore ? collection(firestore, 'bankStatuses') : null),
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
                name: bank.name,
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
          return {
              id: bank.id,
              name: bank.name,
              status: checklistStatus?.status || 'Pendente',
              insertionDate: checklistStatus?.insertionDate || null,
              updatedAt: checklistStatus?.updatedAt || bank.updatedAt,
              priority: calculatePriority(checklistStatus)
          };
      });

      combined.sort((a, b) => a.name.localeCompare(b.name));
      setCombinedBankData(combined);

  }, [masterBanks, userChecklist, isLoadingMasterBanks, isLoadingChecklist]);


  // --- Helper Functions ---
  const calculatePriority = (item: BankChecklistStatus | undefined): 'Alta' | 'Média' | 'Baixa' => {
    if (!item || item.status === 'Pendente' || !item.insertionDate) {
      return 'Média'; 
    }
    const insertionDate = item.insertionDate.toDate();
    const daysSinceUpdate = differenceInDays(new Date(), insertionDate);
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
  const handleAddBank = async () => {
    if (newBankName.trim() === '' || !banksMasterCollectionRef || !firestore || !userChecklistCollectionRef) {
        toast({ variant: 'destructive', title: 'Erro', description: 'O nome do banco não pode estar vazio.' });
        return;
    }
     // Check if bank already exists
    const q = query(banksMasterCollectionRef, where("name", "==", newBankName.trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Este banco já existe.' });
        return;
    }

    const newBankData: Omit<BankMaster, 'id'> = {
      name: newBankName.trim(),
      category: 'Custom',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
        const docRef = await addDoc(banksMasterCollectionRef, newBankData);
        const userChecklistRef = doc(userChecklistCollectionRef, docRef.id);
        const newChecklistItem: Omit<BankChecklistStatus, 'id'> = {
            name: newBankData.name,
            status: 'Pendente',
            insertionDate: null,
            updatedAt: serverTimestamp(),
        };
        // Use non-blocking set which also handles errors
        setDocumentNonBlocking(userChecklistRef, newChecklistItem, {merge: false});

        setNewBankName('');
        toast({ title: 'Banco Adicionado!', description: `O banco ${newBankName} foi adicionado com sucesso.` });

    } catch (error) {
        console.error("Error adding bank:", error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o banco.' });
    }
  };

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

    toast({
        title: `Status Alterado!`,
        description: `A inserção no banco ${currentBank.name} foi marcada como ${newStatus.toLowerCase()}.`,
    });
  };
  
  const isLoading = isUserLoading || isLoadingMasterBanks || isLoadingChecklist;

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Banco</CardTitle>
          <CardDescription>
            Insira o nome do banco para adicioná-lo à lista de checklist de todos os usuários.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
              type="text" 
              placeholder="Nome do Banco" 
              value={newBankName}
              onChange={(e) => setNewBankName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBank()}
            />
            <Button onClick={handleAddBank}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist Diário de Inserções</CardTitle>
          <CardDescription>
            Controle diário da inserção de propostas nos sistemas bancários.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Carregando checklist...</p>}
          {!isLoading && combinedBankData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>Status e Data da Última Atualização</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedBankData.map(bank => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-muted-foreground" />
                      {bank.name}
                    </TableCell>
                    <TableCell>{renderStatus(bank)}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(bank.priority)}>{bank.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco adicionado ao sistema ainda. Comece adicionando um acima.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
