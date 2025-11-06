'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { BankMaster, BankAccessDetails, LoginCredential } from '@/lib/types';
import { useDoc, useFirebase, useUser } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PlusCircle, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface BankAccessManagerModalProps {
  bank: BankMaster;
  isOpen: boolean;
  onClose: () => void;
}

export default function BankAccessManagerModal({ bank, isOpen, onClose }: BankAccessManagerModalProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user } = useUser();

  // State for the form fields
  const [link, setLink] = useState('');
  const [logins, setLogins] = useState<LoginCredential[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([]);

  // Fetch existing access details for this user and bank
  const accessDetailsRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid, 'bankAccessDetails', bank.id) : null),
    [firestore, user, bank.id]
  );
  
  const { data: accessDetails, isLoading } = useDoc<BankAccessDetails>(accessDetailsRef);

  useEffect(() => {
    if (accessDetails) {
      setLink(accessDetails.link || '');
      setLogins(accessDetails.logins || []);
      setShowPasswords(new Array(accessDetails.logins?.length || 0).fill(false));
    } else {
      // Reset if no data is found (e.g., first time opening)
      setLink('');
      setLogins([]);
      setShowPasswords([]);
    }
  }, [accessDetails]);

  const handleAddNewLogin = () => {
    setLogins([...logins, { type: '', username: '', password: '' }]);
    setShowPasswords([...showPasswords, false]);
  };
  
  const handleLoginChange = (index: number, field: keyof LoginCredential, value: string) => {
    const updatedLogins = [...logins];
    updatedLogins[index] = { ...updatedLogins[index], [field]: value };
    setLogins(updatedLogins);
  };
  
  const handleRemoveLogin = (index: number) => {
    const updatedLogins = logins.filter((_, i) => i !== index);
    const updatedShowPasswords = showPasswords.filter((_, i) => i !== index);
    setLogins(updatedLogins);
    setShowPasswords(updatedShowPasswords);
  };

  const toggleShowPassword = (index: number) => {
    const updatedShowPasswords = [...showPasswords];
    updatedShowPasswords[index] = !updatedShowPasswords[index];
    setShowPasswords(updatedShowPasswords);
  };

  const handleSave = () => {
    if (!accessDetailsRef) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar. Referência de dados inválida.' });
      return;
    }
    
    setIsSaving(true);
    
    const dataToSave: Omit<BankAccessDetails, 'id'> = {
      bankId: bank.id,
      link: link,
      logins: logins.filter(l => l.type.trim() || l.username.trim()), // Filter out empty logins
      updatedAt: serverTimestamp(),
    };

    setDocumentNonBlocking(accessDetailsRef, dataToSave, { merge: true });

    toast({ title: 'Sucesso!', description: `Acessos para ${bank.name} foram salvos.` });
    setIsSaving(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
             {bank.logoUrl && <NextImage src={bank.logoUrl} alt={`${bank.name} logo`} width={40} height={40} className="h-10 w-10 object-contain rounded-md" />}
            <DialogTitle>Gerenciar Acessos para: {bank.name}</DialogTitle>
          </div>
          <DialogDescription>
            Adicione o link do portal e as credenciais de acesso. Essas informações são privadas e seguras.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-4 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className='py-4 space-y-6'>
            <div className="space-y-2">
              <Label htmlFor="bank-link">Link do Portal</Label>
              <Input
                id="bank-link"
                placeholder="https://portal.banco.com.br"
                value={link}
                onChange={e => setLink(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <Label>Credenciais de Acesso</Label>
              {logins.map((login, index) => (
                <div key={index} className="flex items-end gap-2 p-3 border rounded-md relative">
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-grow">
                      <div className="space-y-1">
                          <Label htmlFor={`login-type-${index}`} className="text-xs">Tipo</Label>
                          <Input id={`login-type-${index}`} placeholder="Master, Autorizador" value={login.type} onChange={e => handleLoginChange(index, 'type', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                          <Label htmlFor={`login-username-${index}`} className="text-xs">Usuário</Label>
                          <Input id={`login-username-${index}`} placeholder="seu.usuario" value={login.username} onChange={e => handleLoginChange(index, 'username', e.target.value)} />
                      </div>
                      <div className="space-y-1 relative">
                          <Label htmlFor={`login-password-${index}`} className="text-xs">Senha</Label>
                          <Input
                            id={`login-password-${index}`}
                            type={showPasswords[index] ? 'text' : 'password'}
                            placeholder="********"
                            value={login.password || ''}
                            onChange={e => handleLoginChange(index, 'password', e.target.value)}
                          />
                          <Button variant="ghost" size="icon" className="absolute right-0 top-5 h-7 w-7" onClick={() => toggleShowPassword(index)}>
                            {showPasswords[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                      </div>
                   </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleRemoveLogin(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
               <Button variant="outline" size="sm" onClick={handleAddNewLogin}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Credencial
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Fechar</Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Acessos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
