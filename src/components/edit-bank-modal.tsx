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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BankMaster, BankCategory, Promotora } from '@/lib/types';
=======
import type { BankMaster } from '@/lib/types';
>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
=======
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
=======
import { Checkbox } from '@/components/ui/checkbox';
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
import type { BankMaster, BankCategory } from '@/lib/types';
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)
import { useToast } from '@/hooks/use-toast';

interface EditBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: BankMaster;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  promotoras: Promotora[];
  onSave: (updatedData: { name: string, logoUrl: string, categories: BankCategory[], promotoraId?: string }) => Promise<void>;
}

const allCategories: BankCategory[] = ['Inserção', 'CLT', 'FGTS', 'GOV', 'INSS', 'Sem Info'];

export default function EditBankModal({ isOpen, onClose, bank, promotoras, onSave }: EditBankModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [categories, setCategories] = useState<BankCategory[]>([]);
  const [promotoraId, setPromotoraId] = useState<string | undefined>(undefined);
=======
  onSave: (updatedData: { name: string, logoUrl: string }) => Promise<void>;
=======
  onSave: (updatedData: { name: string, logoUrl: string, category: BankCategory }) => Promise<void>;
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)
=======
  onSave: (updatedData: { name: string, logoUrl: string, categories: BankCategory[] }) => Promise<void>;
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
}

const allCategories: BankCategory[] = ['CLT', 'FGTS', 'GOV', 'INSS', 'Custom'];

export default function EditBankModal({ isOpen, onClose, bank, onSave }: EditBankModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
=======
  const [category, setCategory] = useState<BankCategory>('Custom');
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)
=======
  const [categories, setCategories] = useState<BankCategory[]>([]);
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (bank) {
      setName(bank.name);
      setLogoUrl(bank.logoUrl || '');
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      setCategories(bank.categories || []);
      setPromotoraId(bank.promotoraId || 'none');
=======
      setCategory(bank.category || 'Custom');
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)
=======
      setCategories(bank.categories || []);
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
    }
  }, [bank]);

  const handleCategoryChange = (category: BankCategory) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

<<<<<<< HEAD
=======
    }
  }, [bank]);

>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
=======
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
  const handleSave = async () => {
    if (name.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome do banco não pode estar vazio.',
      });
      return;
    }
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
    if (categories.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione pelo menos uma categoria.',
      });
      return;
    }

    setIsSaving(true);
<<<<<<< HEAD
    await onSave({ name, logoUrl, categories, promotoraId: promotoraId === 'none' ? undefined : promotoraId });
=======

    setIsSaving(true);
<<<<<<< HEAD
    await onSave({ name, logoUrl });
>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
=======
    await onSave({ name, logoUrl, category });
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)
=======
    await onSave({ name, logoUrl, categories });
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Banco: {bank.name}</DialogTitle>
          <DialogDescription>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            Atualize os detalhes do banco.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
=======
            Atualize o nome e a URL da logo do banco.
=======
            Atualize o nome, a URL da logo e a categoria do banco.
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
=======
            Atualize o nome, a URL da logo e as categorias do banco.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="promotora-select" className="text-right">
              Promotora
            </Label>
            <Select value={promotoraId} onValueChange={setPromotoraId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione uma promotora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {promotoras.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
=======
>>>>>>> 1386718 (Pode colocar uma opção para mexermos nos bancos já adicionados também? S)
=======
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-bank-category" className="text-right">
              Categoria
=======
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Categorias
>>>>>>> b91eb37 (Mas calma, precisamos poder escolher várias categorias ao mesmo tempo sa)
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
>>>>>>> e14c048 (Vamos lá, quando eu clicar em ação para colocar a url ou for adicionar u)
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
