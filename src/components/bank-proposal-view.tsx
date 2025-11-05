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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { banks, bankCategories } from '@/lib/data';
import type { Proposal, BankStatus, BankCategory } from '@/lib/types';
import { CheckCircle, History } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BankProposalViewProps {
  proposal: Proposal;
}

export default function BankProposalView({ proposal }: BankProposalViewProps) {
  const { toast } = useToast();
  const [bankStatuses, setBankStatuses] = useState<BankStatus[]>([]);

  useEffect(() => {
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
                    {status.insertionDate && <span className="text-xs text-muted-foreground mt-1">{status.insertionDate}</span>}
                </div>
            );
    }
  }

  const renderBanksForCategory = (category: BankCategory) => {
    const filteredBanks = bankStatuses.filter(b => b.category === category);
    
    if (filteredBanks.length === 0) {
        return <p className="text-muted-foreground text-sm p-4">Nenhum banco nesta categoria.</p>;
    }

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
  };

  return (
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
  );
}
