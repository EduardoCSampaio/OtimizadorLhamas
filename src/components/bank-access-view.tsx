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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { KeyRound, Landmark, Link as LinkIcon, Clipboard, Eye, EyeOff, Edit } from 'lucide-react';
import { useCollection, useFirebase, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { BankMaster, BankAccessDetails } from '@/lib/types';
import BankAccessManagerModal from './bank-access-manager-modal';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function BankAccessItem({ bank }: { bank: BankMaster }) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  const accessDetailsRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid, 'bankAccessDetails', bank.id) : null),
    [firestore, user, bank.id]
  );
  const { data: accessDetails, isLoading } = useDoc<BankAccessDetails>(accessDetailsRef);

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: `${fieldName} copiado para a área de transferência.` });
  };

  const toggleShowPassword = (index: number) => {
    setShowPasswords(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleManageAccess = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <AccordionItem value={bank.id}>
        <AccordionTrigger>
          <div className="flex items-center gap-3">
            {bank.logoUrl ? (
              <NextImage src={bank.logoUrl} alt={`${bank.name} logo`} width={24} height={24} className="h-6 w-6 object-contain" />
            ) : (
              <Landmark className="h-6 w-6 text-muted-foreground" />
            )}
            <span className="font-medium">{bank.name}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : accessDetails && (accessDetails.link || accessDetails.logins?.length) ? (
            <div className="p-4 space-y-4">
              {accessDetails.link && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a href={accessDetails.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                      {accessDetails.link}
                    </a>
                  </div>
                </div>
              )}
              {accessDetails.logins?.map((login, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-md">
                   <p className="text-sm font-semibold">{login.type}</p>
                   <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                    <div className='flex-1'>
                      <p className="text-xs text-muted-foreground">Usuário</p>
                      <div className="flex items-center gap-2">
                          <p className="font-mono text-sm">{login.username}</p>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(login.username, 'Usuário')}>
                            <Clipboard className="h-4 w-4" />
                          </Button>
                      </div>
                    </div>
                     <div className='flex-1'>
                      <p className="text-xs text-muted-foreground">Senha</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">
                          {showPasswords[index] ? login.password : '••••••••'}
                        </p>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleShowPassword(index)}>
                            {showPasswords[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(login.password || '', 'Senha')}>
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                   </div>
                </div>
              ))}
               <Button variant="outline" size="sm" onClick={handleManageAccess}>
                  <Edit className="mr-2 h-4 w-4" /> Editar Acessos
              </Button>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-4">
              <p>Nenhum acesso salvo para este banco.</p>
               <Button variant="secondary" size="sm" className="mt-2" onClick={handleManageAccess}>
                <KeyRound className="mr-2 h-4 w-4" /> Adicionar Acessos
              </Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
      {isModalOpen && (
        <BankAccessManagerModal
          bank={bank}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default function BankAccessView() {
  const { firestore } = useFirebase();

  const bankStatusesCollectionRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'bankStatuses'), orderBy('name')) : null),
    [firestore]
  );

  const { data: banks, isLoading } = useCollection<BankMaster>(bankStatusesCollectionRef);

  return (
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
          <div className="space-y-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!isLoading && banks && banks.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {banks?.map((bank) => (
              <BankAccessItem key={bank.id} bank={bank} />
            ))}
          </Accordion>
        ) : (
          !isLoading && (
            <p className="text-muted-foreground text-sm p-4 text-center">
              Nenhum banco cadastrado no sistema. Vá para a página 'Bancos' para começar.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
