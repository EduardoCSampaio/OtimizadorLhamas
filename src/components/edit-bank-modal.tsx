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
import { Checkbox } from '@/components/ui/checkbox';
import type { BankMaster, BankCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface EditBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: BankMaster;
  onSave: (updatedData: { name: string, logoUrl: string, categories: BankCategory[] }) => Promise<void>;
}

const allCategories: BankCategory[] = ['CLT', 'FGTS', 'GOV', 'INSS', 'Sem Info'];

export default function EditBankModal({ isOpen, onClose, bank, onSave }: EditBankModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [categories, setCategories] = useState<BankCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (bank) {
      setName(bank.name);
      setLogoUrl(bank.logoUrl || '');
      setCategories(bank.categories || []);
    }
  }, [bank]);

  const handleCategoryChange = (category: BankCategory) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    if (name.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome do banco não pode estar vazio.',
      });
      return;
    }
    if (categories.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione pelo menos uma categoria.',
      });
      return;
    }

    setIsSaving(true);
    await onSave({ name, logoUrl, categories });
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Banco: {bank.name}</DialogTitle>
          <DialogDescription>
            Atualize o nome, a URL da logo e as categorias do banco.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
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
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Categorias
            </Label>
            <div className="col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                {allCategories.map(cat => (
                    <div key={cat} className="flex items-center space-x-2">
                        <Checkbox
                            id={`edit-cat-${cat}`}
                            checked={categories.includes(cat)}
                            onCheckedChange={() => handleCategoryChange(cat)}
                        />
                        <Label htmlFor={`edit-cat-${cat}`} className="font-normal">{cat}</Label>
                    </div>
                ))}
            </div>
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
