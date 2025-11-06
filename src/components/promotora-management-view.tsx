'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, doc, where, getDocs } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { createActivityLog } from '@/firebase/user-data';
import type { Promotora } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Briefcase, PlusCircle, Edit, Trash2 } from 'lucide-react';
import EditPromotoraModal from './edit-promotora-modal';

export default function PromotoraManagementView() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  // Form State
  const [newPromotoraName, setNewPromotoraName] = useState('');
  const [newPromotoraLogoUrl, setNewPromotoraLogoUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPromotora, setSelectedPromotora] = useState<Promotora | null>(null);

  // Data Fetching
  const promotorasCollectionRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'promotoras'), orderBy('name')) : null),
    [firestore]
  );
  const { data: promotoras, isLoading } = useCollection<Promotora>(promotorasCollectionRef);

  const handleAddPromotora = async () => {
    if (newPromotoraName.trim() === '') {
      toast({ variant: 'destructive', title: 'Erro', description: 'O nome da promotora não pode estar vazio.' });
      return;
    }
    if (!firestore || !user) return;
    setIsAdding(true);

    const promotorasRef = collection(firestore, 'promotoras');
    const q = query(promotorasRef, where('name', '==', newPromotoraName.trim()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Uma promotora com este nome já existe.' });
        setIsAdding(false);
        return;
    }

    const newPromotoraData = {
      name: newPromotoraName.trim(),
      logoUrl: newPromotoraLogoUrl.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(promotorasRef, newPromotoraData);
    createActivityLog(firestore, user.email || 'unknown', {
      type: 'CREATE',
      description: `Adicionou a promotora: ${newPromotoraName.trim()}`,
    });

    toast({ title: 'Promotora Adicionada!', description: `A promotora ${newPromotoraName.trim()} foi criada.` });
    setNewPromotoraName('');
    setNewPromotoraLogoUrl('');
    setIsAdding(false);
  };

  const handleOpenEditModal = (promotora: Promotora) => {
    setSelectedPromotora(promotora);
    setIsEditModalOpen(true);
  };
  
  const handleUpdatePromotora = async (id: string, data: { name: string, logoUrl?: string }) => {
    if (!firestore || !user) return;
    const promotoraDocRef = doc(firestore, 'promotoras', id);
    updateDocumentNonBlocking(promotoraDocRef, { ...data, updatedAt: serverTimestamp() });
    
    createActivityLog(firestore, user.email || 'unknown', {
        type: 'UPDATE',
        description: `Atualizou a promotora: ${data.name}`,
    });

    toast({ title: 'Promotora Atualizada!', description: `A promotora ${data.name} foi atualizada.`});
    setIsEditModalOpen(false);
  };

  const handleDeletePromotora = (promotora: Promotora) => {
    if (!firestore || !user) return;
    const promotoraDocRef = doc(firestore, 'promotoras', promotora.id);
    deleteDocumentNonBlocking(promotoraDocRef);

    createActivityLog(firestore, user.email || 'unknown', {
        type: 'DELETE',
        description: `Removeu a promotora: ${promotora.name}`,
    });
    
    toast({ title: 'Promotora Removida!', description: `A promotora ${promotora.name} foi removida.`});
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Nova Promotora</CardTitle>
          <CardDescription>
            Insira os detalhes para criar uma nova promotora no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grid gap-2 flex-grow">
              <Label htmlFor="promotora-name">Nome da Promotora</Label>
              <Input
                id="promotora-name"
                value={newPromotoraName}
                onChange={(e) => setNewPromotoraName(e.target.value)}
                placeholder="Ex: LhamasCRED"
              />
            </div>
            <div className="grid gap-2 flex-grow">
              <Label htmlFor="promotora-logo">URL da Logo</Label>
              <Input
                id="promotora-logo"
                value={newPromotoraLogoUrl}
                onChange={(e) => setNewPromotoraLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
              />
            </div>
            <Button onClick={handleAddPromotora} disabled={isAdding}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isAdding ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promotoras Cadastradas</CardTitle>
          <CardDescription>
            Visualize, edite ou remova as promotoras existentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : promotoras && promotoras.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promotora</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotoras.map((promotora) => (
                  <TableRow key={promotora.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {promotora.logoUrl ? (
                          <Image src={promotora.logoUrl} alt={promotora.name} width={24} height={24} className="h-6 w-6 object-contain rounded-sm"/>
                        ) : (
                          <Briefcase className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span>{promotora.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(promotora)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="h-8 w-8">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remover</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso removerá permanentemente a promotora <strong>{promotora.name}</strong>. Os bancos associados a ela não serão removidos, mas a associação será perdida.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePromotora(promotora)}>
                                        Continuar e Remover
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm text-center p-4">
              Nenhuma promotora cadastrada. Adicione uma acima para começar.
            </p>
          )}
        </CardContent>
      </Card>

      {selectedPromotora && (
        <EditPromotoraModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            promotora={selectedPromotora}
            onSave={handleUpdatePromotora}
        />
      )}
    </>
  );
}
