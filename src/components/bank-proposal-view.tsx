"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import type { BankChecklistStatus, BankMaster, BankCategory, UserProfile } from '@/lib/types';
import { CheckCircle, History, Landmark, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCollection, useFirebase, useUser } from '@/firebase';
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
=======
import { banks, bankCategories } from '@/lib/data';
import type { Proposal, BankStatus, BankCategory } from '@/lib/types';
import { CheckCircle, History } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
>>>>>>> 72b0cd5 (Não é bem como deveria ser, teria que ter os bancos anotados, a data que)

type CombinedBankStatus = BankMaster & BankChecklistStatus & { priority: 'Alta' | 'Média' | 'Baixa' };

export default function BankProposalView() {
  const { toast } = useToast();
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
<<<<<<< HEAD
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
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
    // Initialize bank statuses
    const initialStatuses = banks.map(bank => ({
      ...bank,
      status: 'Pendente' as const,
      insertionDate: undefined,
      priority: (['Itaú', 'Bradesco'].includes(bank.name) ? 'Alta' : 'Média') as 'Alta' | 'Média' | 'Baixa',
    }));
    setBankStatuses(initialStatuses);
  }, []);

  const handleToggleStatus = (bankId: string) => {
    setBankStatuses(prev =>
      prev.map(b => {
        if (b.id === bankId) {
          const isCompleted = b.status === 'Concluído';
          const newStatus = isCompleted ? 'Pendente' : 'Concluído';
          const newDate = isCompleted ? undefined : format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
          
          toast({
              title: `Status Alterado!`,
              description: `A inserção no banco ${b.name} foi marcada como ${newStatus.toLowerCase()}.`,
          });

          return { ...b, status: newStatus, insertionDate: newDate };
        }
        return b;
      })
    );
>>>>>>> 72b0cd5 (Não é bem como deveria ser, teria que ter os bancos anotados, a data que)
  };

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
    const insertionDate = status.insertionDate ? status.insertionDate.toDate() : null;
=======
  const renderStatus = (status: BankStatus) => {
>>>>>>> 72b0cd5 (Não é bem como deveria ser, teria que ter os bancos anotados, a data que)
    switch(status.status) {
        case 'Pendente': 
            return <Badge variant="outline">Pendente</Badge>;
        case 'Concluído': 
            return (
                <div className="flex flex-col">
                    <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-3 w-3"/>Concluído</Badge>
<<<<<<< HEAD
                    {insertionDate && <span className="text-xs text-muted-foreground mt-1">{format(insertionDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>}
=======
                    {status.insertionDate && <span className="text-xs text-muted-foreground mt-1">{status.insertionDate}</span>}
>>>>>>> 72b0cd5 (Não é bem como deveria ser, teria que ter os bancos anotados, a data que)
                </div>
            );
    }
  }

  const handleToggleStatus = (bankId: string) => {
    if (!user || !firestore) return;
    
    const bankDocRef = doc(firestore, 'users', user.uid, 'bankChecklists', bankId);
    const currentBank = combinedBankData.find(b => b.id === bankId);
    if (!currentBank) return;

<<<<<<< HEAD
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
=======
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Banco</TableHead>
            <TableHead>Status e Data</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBanks.map(bank => (
            <TableRow key={bank.id}>
              <TableCell className="font-medium flex items-center gap-2">
                <bank.icon className="h-4 w-4 text-muted-foreground" />
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
                      Marcar como Concluído
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
    );
>>>>>>> 72b0cd5 (Não é bem como deveria ser, teria que ter os bancos anotados, a data que)
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
  
  const isLoading = isLoadingMasterBanks || isLoadingChecklist;

  return (
<<<<<<< HEAD
    <>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>Outras Categorias</TableHead>
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
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {bank.categories?.filter(c => c !== 'Inserção').map(cat => (
                          <Badge key={cat} variant={getCategoryBadgeVariant(cat)}>{cat}</Badge>
                        ))}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco de inserção encontrado. Vá para a página 'Bancos' para adicionar bancos e marcá-los com a categoria "Inserção".</p>
          )}
        </CardContent>
      </Card>
    </>
=======
    <Card>
      <CardHeader>
        <CardTitle>2. Controlar Inserções</CardTitle>
        <CardDescription>
          Marque os bancos onde a proposta de{' '}
          <span className="font-semibold text-primary">{proposal.clientName}</span>{' '}
          já foi inserida.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={bankCategories[0]}>
          <TabsList>
            {bankCategories.map(category => (
                <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>
          {bankCategories.map(category => (
            <TabsContent key={category} value={category}>
                {renderBanksForCategory(category)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
>>>>>>> 72b0cd5 (Não é bem como deveria ser, teria que ter os bancos anotados, a data que)
  );
}
