'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { BankMaster, BankCategory } from '@/lib/types';
import { Landmark, PlusCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirebase, useUser } from '@/firebase';
import {
  collection,
  doc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { useMemoFirebase } from '@/firebase/provider';
import EditBankModal from './edit-bank-modal';
import { createActivityLog } from '@/firebase/user-data';
import { Skeleton } from './ui/skeleton';

const allCategories: BankCategory[] = ['Inserção', 'CLT', 'FGTS', 'GOV', 'INSS', 'Sem Info'];

export default function BankManagementView() {
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const [newBankName, setNewBankName] = useState('');
  const [newBankLogoUrl, setNewBankLogoUrl] = useState('');
  const [newBankCategories, setNewBankCategories] = useState<BankCategory[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankMaster | null>(null);

  // Master list of all banks, ordered by name
  const banksMasterCollectionRef = useMemoFirebase(
    () =>
      firestore ? query(collection(firestore, 'bankStatuses'), orderBy('name')) : null,
    [firestore]
  );
  const { data: masterBanks, isLoading: isLoadingMasterBanks } =
    useCollection<BankMaster>(banksMasterCollectionRef);

  const getCategoryBadgeVariant = (category: BankCategory) => {
    switch (category) {
      case 'CLT': return 'default';
      case 'FGTS': return 'secondary';
      case 'GOV': return 'outline';
      case 'INSS': return 'destructive';
      case 'Inserção': return 'default'; // Or choose a specific color
      default: return 'secondary';
    }
  };

  const handleNewCategoryChange = (category: BankCategory) => {
    setNewBankCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleAddBank = async () => {
    if (newBankName.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome do banco não pode estar vazio.',
      });
      return;
    }
    if (newBankCategories.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione pelo menos uma categoria.',
      });
      return;
    }
    if (!firestore || !user) return;

    const masterBankCollection = collection(firestore, 'bankStatuses');
    const q = query(masterBankCollection, where('name', '==', newBankName.trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Este banco já existe.' });
      return;
    }

    const newBankData: Omit<BankMaster, 'id'> = {
      name: newBankName.trim(),
      logoUrl: newBankLogoUrl.trim(),
      categories: newBankCategories,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(masterBankCollection, newBankData);

    createActivityLog(firestore, user.email || 'unknown', {
      type: 'CREATE',
      description: `Adicionou o banco: ${newBankName.trim()}`,
    });

    setNewBankName('');
    setNewBankLogoUrl('');
    setNewBankCategories([]);
    toast({
      title: 'Banco Adicionado!',
      description: `O banco ${newBankName} foi adicionado com sucesso.`,
    });
  };

  const handleOpenEditModal = (bank: BankMaster) => {
    setSelectedBank(bank);
    setIsEditModalOpen(true);
  };

  const handleUpdateBank = async (updatedData: {
    name: string;
    logoUrl: string;
    categories: BankCategory[];
  }) => {
    if (!firestore || !selectedBank || !user) return;

    const bankMasterRef = doc(firestore, 'bankStatuses', selectedBank.id);

    try {
      await updateDoc(bankMasterRef, {
        name: updatedData.name,
        logoUrl: updatedData.logoUrl,
        categories: updatedData.categories,
        updatedAt: serverTimestamp(),
      });

      createActivityLog(firestore, user.email || 'unknown', {
        type: 'UPDATE',
        description: `Atualizou os dados do banco: ${updatedData.name}`,
      });

      toast({
        title: 'Banco Atualizado!',
        description: `O banco ${updatedData.name} foi atualizado com sucesso.`,
      });
      setIsEditModalOpen(false);
      setSelectedBank(null);
    } catch (error) {
      console.error('Error updating bank:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o banco.',
      });
    }
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Novo Banco</CardTitle>
          <CardDescription>
            Insira os detalhes do banco para adicioná-lo ao sistema. Marque 'Inserção' para
            que ele apareça no checklist diário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Nome do Banco</Label>
                <Input
                  id="bank-name"
                  type="text"
                  placeholder="Ex: Banco do Brasil"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-logo">URL da Logo</Label>
                <Input
                  id="bank-logo"
                  type="text"
                  placeholder="https://.../logo.png"
                  value={newBankLogoUrl}
                  onChange={(e) => setNewBankLogoUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categorias</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-2 border rounded-md">
                  {allCategories.map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox
                        id={`new-cat-${cat}`}
                        checked={newBankCategories.includes(cat)}
                        onCheckedChange={() => handleNewCategoryChange(cat)}
                      />
                      <Label htmlFor={`new-cat-${cat}`} className="font-normal">
                        {cat}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={handleAddBank}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Banco
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Bancos</CardTitle>
          <CardDescription>
            Visualize e edite todos os bancos cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMasterBanks && (
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          )}
          {!isLoadingMasterBanks && masterBanks && masterBanks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>Categorias</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masterBanks.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {bank.logoUrl ? (
                          <Image
                            src={bank.logoUrl}
                            alt={`${bank.name} logo`}
                            width={24}
                            height={24}
                            className="h-6 w-6 object-contain"
                          />
                        ) : (
                          <Landmark className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span>{bank.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {bank.categories?.map((cat) => (
                          <Badge key={cat} variant={getCategoryBadgeVariant(cat)}>
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenEditModal(bank)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar Banco</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoadingMasterBanks && (
              <p className="text-muted-foreground text-sm p-4 text-center">
                Nenhum banco adicionado ao sistema ainda. Comece adicionando um acima.
              </p>
            )
          )}
        </CardContent>
      </Card>
      {selectedBank && (
        <EditBankModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          bank={selectedBank}
          onSave={handleUpdateBank}
        />
      )}
    </>
  );
}
