'use client';

import { useState, useMemo } from 'react';
import NextImage from 'next/image';
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
import { Button } from '@/components/ui/button';
import { KeyRound, Landmark } from 'lucide-react';
import { useCollection, useFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { BankMaster } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import BankAccessManagerModal from './bank-access-manager-modal';
import { Skeleton } from './ui/skeleton';

export default function BankAccessView() {
  const { firestore } = useFirebase();
  const [selectedBank, setSelectedBank] = useState<BankMaster | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bankStatusesCollectionRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'bankStatuses'), orderBy('name')) : null),
    [firestore]
  );

  const { data: banks, isLoading } = useCollection<BankMaster>(bankStatusesCollectionRef);

  const handleManageAccess = (bank: BankMaster) => {
    setSelectedBank(bank);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className='flex items-center gap-3'>
              <KeyRound className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Meus Acessos aos Bancos</CardTitle>
                <CardDescription>
                  Gerencie seus links e credenciais de acesso para cada banco. Estas informações são privadas e visíveis apenas para você.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          )}
          {!isLoading && banks && banks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banks?.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">
                       <div className="flex items-center gap-3">
                        {bank.logoUrl ? (
                          <NextImage src={bank.logoUrl} alt={`${bank.name} logo`} width={24} height={24} className="h-6 w-6 object-contain"/>
                        ) : (
                          <Landmark className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span>{bank.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageAccess(bank)}
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        Gerenciar Acessos
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && (
              <p className="text-muted-foreground text-sm p-4 text-center">
                Nenhum banco cadastrado no sistema. Vá para a página 'Bancos' para começar.
              </p>
            )
          )}
        </CardContent>
      </Card>
      {selectedBank && (
        <BankAccessManagerModal
          bank={selectedBank}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
