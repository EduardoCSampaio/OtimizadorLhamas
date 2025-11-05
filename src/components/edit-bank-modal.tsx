'use client';

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BankMaster, BankCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface EditBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: BankMaster;
  onSave: (updatedData: { name: string, logoUrl: string, category: BankCategory }) => Promise<void>;
}

const categories: BankCategory[] = ['CLT', 'FGTS', 'GOV', 'INSS', 'Custom'];

export default function EditBankModal({ isOpen, onClose, bank, onSave }: EditBankModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [category, setCategory] = useState<BankCategory>('Custom');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (bank) {
      setName(bank.name);
      setLogoUrl(bank.logoUrl || '');
      setCategory(bank.category || 'Custom');
    }
  }, [bank]);

  const handleSave = async () => {
    if (name.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome do banco não pode estar vazio.',
      });
      return;
    }

    setIsSaving(true);
    await onSave({ name, logoUrl, category });
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Banco: {bank.name}</DialogTitle>
          <DialogDescription>
            Atualize o nome, a URL da logo e a categoria do banco.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-bank-name" className="text-right">
              Nome
            </Label>
            <Input
              id="edit-bank-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-bank-logo" className="text-right">
              URL da Logo
            </Label>
            <Input
              id="edit-bank-logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-bank-category" className="text-right">
              Categoria
            </Label>
             <Select value={category} onValueChange={(value: BankCategory) => setCategory(value)}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
