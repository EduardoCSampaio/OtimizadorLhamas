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
import { useToast } from '@/hooks/use-toast';
import type { Promotora } from '@/lib/types';

interface EditPromotoraModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotora: Promotora;
  onSave: (id: string, data: { name: string, logoUrl?: string }) => Promise<void>;
}

export default function EditPromotoraModal({ isOpen, onClose, promotora, onSave }: EditPromotoraModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (promotora) {
      setName(promotora.name);
      setLogoUrl(promotora.logoUrl || '');
    }
  }, [promotora]);

  const handleSave = async () => {
    if (name.trim() === '') {
      toast({ variant: 'destructive', title: 'Erro', description: 'O nome da promotora não pode estar vazio.' });
      return;
    }
    setIsSaving(true);
    await onSave(promotora.id, { name: name.trim(), logoUrl: logoUrl.trim() });
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Promotora: {promotora.name}</DialogTitle>
          <DialogDescription>
            Atualize o nome e a URL da logo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-promotora-name" className="text-right">
              Nome
            </Label>
            <Input
              id="edit-promotora-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-promotora-logo" className="text-right">
              URL da Logo
            </Label>
            <Input
              id="edit-promotora-logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="col-span-3"
            />
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
