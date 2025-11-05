'use client';

import { useState } from 'react';
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
import {
  BookCopy,
  Settings,
  Landmark,
} from 'lucide-react';
import {
  useCollection,
  useFirebase,
} from '@/firebase';
import { collection } from 'firebase/firestore';
import type { BankMaster } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import CltRulesManagerModal from './clt-rules-manager-modal';


interface CltRulesViewProps {
  userRole: 'master' | 'user' | null;
}

export default function CltRulesView({ userRole }: CltRulesViewProps) {
  const { firestore } = useFirebase();
  const [selectedBank, setSelectedBank] = useState<BankMaster | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isMaster = userRole === 'master';

  const bankStatusesCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'bankStatuses') : null),
    [firestore]
  );
  
  const { data: banks, isLoading } = useCollection<BankMaster>(bankStatusesCollectionRef);

  const sortedBanks = banks?.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const handleManageRules = (bank: BankMaster) => {
    setSelectedBank(bank);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookCopy className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Regras de Negócio - CLT</CardTitle>
              <CardDescription>
                {isMaster 
                  ? 'Gerencie as regras de negócio para cada banco.'
                  : 'Consulte as regras de negócio para cada banco.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Carregando bancos...</p>}
          {!isLoading && banks && banks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBanks?.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                       <Landmark className="h-4 w-4 text-muted-foreground" />
                      {bank.name}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => handleManageRules(bank)}>
                         <Settings className="mr-2 h-4 w-4" />
                         {isMaster ? 'Gerenciar Regras' : 'Visualizar Regras'}
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && (
              <p className="text-muted-foreground text-sm p-4 text-center">
                Nenhum banco cadastrado no sistema.
              </p>
            )
          )}
        </CardContent>
      </Card>
      {selectedBank && (
        <CltRulesManagerModal
          bank={selectedBank}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userRole={userRole}
        />
      )}
    </>
  );
}
