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
import type { BankStatus } from '@/lib/types';
import { CheckCircle, History, Landmark, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BankProposalView() {
  const { toast } = useToast();
  const [bankStatuses, setBankStatuses] = useState<BankStatus[]>([]);
  const [newBankName, setNewBankName] = useState('');

  const calculatePriority = (bank: BankStatus): 'Alta' | 'Média' | 'Baixa' => {
    if (bank.status === 'Pendente' || !bank.insertionDate) {
        const daysSinceCreation = bank.insertionDate ? differenceInDays(new Date(), bank.insertionDate) : 0;
        if (daysSinceCreation >= 2) return 'Alta';
        return 'Média';
    }
    const daysSinceUpdate = differenceInDays(new Date(), bank.insertionDate);
    if (daysSinceUpdate >= 2) return 'Alta';
    if (daysSinceUpdate >= 1) return 'Média';
    return 'Baixa';
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setBankStatuses(prev => prev.map(b => ({...b, priority: calculatePriority(b)})));
    }, 1000 * 60); // Update priorities every minute

    return () => clearInterval(interval);
  }, []);

  const handleAddBank = () => {
    if (newBankName.trim() === '') {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'O nome do banco não pode estar vazio.',
        });
        return;
    }

    const newBank: BankStatus = {
      id: newBankName.toLowerCase().replace(/\s/g, ''),
      name: newBankName,
      category: 'Custom',
      icon: Landmark,
      status: 'Pendente',
      priority: 'Média', // Initial priority
      insertionDate: new Date(),
    };

    setBankStatuses(prev => [...prev, newBank].map(b => ({...b, priority: calculatePriority(b)})));
    setNewBankName('');
    toast({
      title: 'Banco Adicionado!',
      description: `O banco ${newBankName} foi adicionado à lista.`,
    });
  };

  const handleToggleStatus = (bankId: string) => {
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
          
          const updatedBank = { ...b, status: newStatus, insertionDate: newDate };
          return { ...updatedBank, priority: calculatePriority(updatedBank) };
        }
        return b;
      })
    );
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

  const renderStatus = (status: BankStatus) => {
    switch(status.status) {
        case 'Pendente': 
            return <Badge variant="outline">Pendente</Badge>;
        case 'Concluído': 
            return (
                <div className="flex flex-col">
                    <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-3 w-3"/>Concluído</Badge>
                    {status.insertionDate && <span className="text-xs text-muted-foreground mt-1">{format(status.insertionDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>}
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
          {bankStatuses.length > 0 ? (
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
                {bankStatuses.map(bank => (
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
            <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco adicionado ainda. Comece adicionando um acima.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
