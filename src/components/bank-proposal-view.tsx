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
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
      priority: (['Itaú', 'Bradesco'].includes(bank.name) ? 'Alta' : 'Média') as 'Alta' | 'Média' | 'Baixa',
    }));
    setBankStatuses(initialStatuses);
  }, []);

  const handleSubmission = (bankId: string) => {
    setBankStatuses(prev =>
      prev.map(b => (b.id === bankId ? { ...b, status: 'Enviando...' } : b))
    );
    
    toast({
        title: 'Enviando Proposta...',
        description: `A proposta para ${proposal.clientName} está sendo enviada para ${banks.find(b => b.id === bankId)?.name}.`,
    });

    // Simulate API call
    setTimeout(() => {
        const isSuccess = Math.random() > 0.3; // 70% chance of success
        setBankStatuses(prev =>
            prev.map(b => {
                if (b.id === bankId) {
                    const newStatus = isSuccess ? 'Enviado' : 'Rejeitado';
                    toast({
                        title: `Proposta ${newStatus === 'Enviado' ? 'Enviada' : 'Falhou'}`,
                        description: `A proposta para o banco ${b.name} foi ${newStatus === 'Enviado' ? 'enviada com sucesso' : 'rejeitada na validação inicial'}.`,
                        variant: newStatus === 'Enviado' ? 'default' : 'destructive',
                    });
                    return { ...b, status: newStatus };
                }
                return b;
            })
        );
    }, 2000 + Math.random() * 2000);
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

  const renderStatus = (status: BankStatus['status']) => {
    switch(status) {
        case 'Pendente': return <Badge variant="outline">Pendente</Badge>;
        case 'Enviando...': return <Badge variant="secondary"><Loader2 className="mr-2 h-3 w-3 animate-spin"/>Enviando...</Badge>;
        case 'Enviado': return <Badge className="bg-sky-600"><CheckCircle className="mr-2 h-3 w-3"/>Enviado</Badge>;
        case 'Aprovado': return <Badge className="bg-green-600"><CheckCircle className="mr-2 h-3 w-3"/>Aprovado</Badge>;
        case 'Rejeitado': return <Badge variant="destructive"><XCircle className="mr-2 h-3 w-3"/>Rejeitado</Badge>;
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
            <TableHead>Status</TableHead>
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
              <TableCell>{renderStatus(bank.status)}</TableCell>
              <TableCell>
                <Badge variant={getPriorityBadgeVariant(bank.priority)}>{bank.priority}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSubmission(bank.id)}
                    disabled={bank.status !== 'Pendente' && bank.status !== 'Rejeitado'}
                >
                  <Send className="h-4 w-4 mr-2"/>
                  Enviar
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
        <CardTitle>2. Enviar Propostas</CardTitle>
        <CardDescription>
          Selecione os bancos para os quais deseja enviar a proposta de{' '}
          <span className="font-semibold text-primary">{proposal.clientName}</span>.
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
