'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useDoc, useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { AccessDetails, BankMaster } from '@/lib/types';
import { KeyRound, Link as LinkIcon, Clipboard, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/provider';
import { Skeleton } from './ui/skeleton';

interface AccessInfoPopoverProps {
  bank: BankMaster;
}

export default function AccessInfoPopover({ bank }: AccessInfoPopoverProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const accessId = bank.promotoraId || bank.id;
  const collectionPath = bank.promotoraId ? 'promotoraAccessDetails' : 'bankAccessDetails';

  const accessDetailsRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid, collectionPath, accessId) : null),
    [firestore, user, accessId, collectionPath]
  );
  const { data: accessDetails, isLoading } = useDoc<AccessDetails>(accessDetailsRef, {
    enabled: isOpen, // Only fetch when the popover is open
  });

  const hasDetails = accessDetails && (accessDetails.link || (accessDetails.logins && accessDetails.logins.length > 0));

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: `${fieldName} copiado para a área de transferência.` });
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <KeyRound className="h-4 w-4" />
          <span className="sr-only">Ver Acessos</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Acesso Rápido: {bank.name}</h4>
            <p className="text-sm text-muted-foreground">
              {bank.promotoraId ? 'Acesso via promotora.' : 'Acesso direto ao banco.'}
            </p>
          </div>
          <div className="grid gap-2">
            {isLoading ? (
                <Skeleton className="h-24 w-full" />
            ) : hasDetails ? (
              <div className="space-y-4">
                {accessDetails.link && (
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <a href={accessDetails.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                        {accessDetails.link}
                        </a>
                    </div>
                )}
                {accessDetails.logins?.map((login, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-md">
                    <p className="text-sm font-semibold">{login.type}</p>
                    <div className='flex flex-col gap-2'>
                        <div>
                            <p className="text-xs text-muted-foreground">Usuário</p>
                            <div className="flex items-center gap-1">
                                <p className="font-mono text-sm truncate">{login.username}</p>
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopyToClipboard(login.username, 'Usuário')}>
                                    <Clipboard className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {login.password && (
                            <div>
                                <p className="text-xs text-muted-foreground">Senha</p>
                                <div className="flex items-center gap-1">
                                    <p className="font-mono text-sm">
                                    {showPasswords[`pass-${index}`] ? login.password : '••••••••'}
                                    </p>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => toggleShowPassword(`pass-${index}`)}>
                                        {showPasswords[`pass-${index}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopyToClipboard(login.password || '', 'Senha')}>
                                    <Clipboard className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                         {login.subPassword && (
                            <div>
                                <p className="text-xs text-muted-foreground">Subsenha</p>
                                <div className="flex items-center gap-1">
                                    <p className="font-mono text-sm">
                                    {showPasswords[`subpass-${index}`] ? login.subPassword : '••••••••'}
                                    </p>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => toggleShowPassword(`subpass-${index}`)}>
                                        {showPasswords[`subpass-${index}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopyToClipboard(login.subPassword || '', 'Subsenha')}>
                                    <Clipboard className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                ))}
            </div>
            ) : (
                <p className="text-sm text-center text-muted-foreground py-4">
                    Nenhuma credencial salva para este acesso. Configure na página "Meus Acessos".
                </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
