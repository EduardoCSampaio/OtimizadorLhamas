"use client";

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BankChecklistStatus, BankMaster } from '@/lib/types';
import { CheckCircle, History, Landmark, PlusCircle, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCollection, useFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch, getDocs, query, where, addDoc, orderBy, updateDoc, runTransaction } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useMemoFirebase } from '@/firebase/provider';
import EditBankModal from './edit-bank-modal';

type CombinedBankStatus = BankMaster & BankChecklistStatus & { priority: 'Alta' | 'Média' | 'Baixa' };

export default function BankProposalView() {
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  // --- State and Refs ---
  const [newBankName, setNewBankName] = useState('');
  const [newBankLogoUrl, setNewBankLogoUrl] = useState('');
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
    if (newBankName.trim() === '') {
        toast({ variant: 'destructive', title: 'Erro', description: 'O nome do banco não pode estar vazio.' });
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
      category: 'Custom',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(masterBankCollection, newBankData);

    setNewBankName('');
    setNewBankLogoUrl('');
    toast({ title: 'Banco Adicionado!', description: `O banco ${newBankName} foi adicionado com sucesso.` });
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

  const handleOpenEditModal = (bank: BankMaster) => {
    setSelectedBank(bank);
    setIsEditModalOpen(true);
  };
  
  const handleUpdateBank = async (updatedData: { name: string, logoUrl: string }) => {
    if (!firestore || !selectedBank) return;
  
    const bankMasterRef = doc(firestore, 'bankStatuses', selectedBank.id);
  
    try {
      await updateDoc(bankMasterRef, {
        name: updatedData.name,
        logoUrl: updatedData.logoUrl,
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
      {isMaster && (
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
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {bank.logoUrl ? (
                          <Image src={bank.logoUrl} alt={`${bank.name} logo`} width={24} height={24} className="h-6 w-6 object-contain"/>
                        ) : (
                          <Landmark className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span>{bank.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{renderStatus(bank)}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(bank.priority)}>{bank.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
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
            !isLoading && <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco adicionado ao sistema ainda. Comece adicionando um acima.</p>
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
