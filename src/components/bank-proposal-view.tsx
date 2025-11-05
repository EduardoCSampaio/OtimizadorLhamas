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
import type { BankStatus, BankStatusDocument } from '@/lib/types';
import { CheckCircle, History, Landmark, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCollection, useFirebase, useUser } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useMemoFirebase } from '@/firebase/provider';

export default function BankProposalView() {
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const bankStatusesCollectionRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return collection(firestore, 'users', user.uid, 'bankStatuses');
  }, [firestore, user]);

  const { data: bankStatuses, isLoading } = useCollection<BankStatusDocument>(bankStatusesCollectionRef);
  const [newBankName, setNewBankName] = useState('');

  const calculatePriority = (bank: BankStatusDocument): 'Alta' | 'Média' | 'Baixa' => {
    const insertionDate = bank.insertionDate ? bank.insertionDate.toDate() : null;
    if (bank.status === 'Pendente' || !insertionDate) {
        const creationDate = bank.createdAt ? bank.createdAt.toDate() : new Date();
        const daysSinceCreation = differenceInDays(new Date(), creationDate);
        if (daysSinceCreation >= 2) return 'Alta';
        return 'Média';
    }
    const daysSinceUpdate = differenceInDays(new Date(), insertionDate);
    if (daysSinceUpdate >= 2) return 'Alta';
    if (daysSinceUpdate >= 1) return 'Média';
    return 'Baixa';
  };

  const sortedBankStatuses = bankStatuses?.map(b => ({...b, priority: calculatePriority(b)})).sort((a, b) => a.name.localeCompare(b.name));

  const handleAddBank = () => {
    if (newBankName.trim() === '' || !user || !bankStatusesCollectionRef) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'O nome do banco não pode estar vazio.',
        });
        return;
    }

    const newBank: Omit<BankStatusDocument, 'id'> = {
      name: newBankName,
      category: 'Custom',
      status: 'Pendente',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      insertionDate: null,
    };

    addDocumentNonBlocking(bankStatusesCollectionRef, newBank);
    setNewBankName('');
    toast({
      title: 'Banco Adicionado!',
      description: `O banco ${newBankName} foi adicionado à lista.`,
    });
  };

  const handleToggleStatus = (bankId: string) => {
    if (!user || !firestore) return;
    
    const bankDocRef = doc(firestore, 'users', user.uid, 'bankStatuses', bankId);
    const currentBank = bankStatuses?.find(b => b.id === bankId);
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

  const getPriorityBadgeVariant = (priority: 'Alta' | 'Média' | 'Baixa') => {
    switch (priority) {
      case 'Alta':
        return 'destructive';
      case 'Média':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const renderStatus = (status: BankStatusDocument) => {
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

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Banco</CardTitle>
          <CardDescription>
            Insira o nome do banco para adicioná-lo à sua lista de checklist.
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
          {isLoading && <p>Carregando bancos...</p>}
          {!isLoading && bankStatuses && bankStatuses.length > 0 ? (
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
                {sortedBankStatuses?.map(bank => (
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
            !isLoading && <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco adicionado ainda. Comece adicionando um acima.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
