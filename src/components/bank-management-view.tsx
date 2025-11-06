'use client';

import { useState, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BankMaster, BankCategory, Promotora } from '@/lib/types';
import { Landmark, PlusCircle, Edit, Briefcase, Search } from 'lucide-react';
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
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useMemoFirebase } from '@/firebase/provider';
import EditBankModal from './edit-bank-modal';
import { createActivityLog } from '@/firebase/user-data';
import { Skeleton } from './ui/skeleton';

const allCategories: BankCategory[] = ['Inserção', 'CLT', 'FGTS', 'GOV', 'INSS', 'Sem Info'];

export default function BankManagementView() {
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  // Form state
  const [newBankName, setNewBankName] = useState('');
  const [newBankLogoUrl, setNewBankLogoUrl] = useState('');
  const [newBankCategories, setNewBankCategories] = useState<BankCategory[]>([]);
  const [newBankPromotoraId, setNewBankPromotoraId] = useState<string | undefined>(undefined);
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankMaster | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<BankCategory | 'all'>('all');
  const [filterPromotora, setFilterPromotora] = useState<string | 'all'>('all');


  // Data fetching
  const banksMasterCollectionRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'bankStatuses'), orderBy('name')) : null),
    [firestore]
  );
  const { data: masterBanks, isLoading: isLoadingMasterBanks } = useCollection<BankMaster>(banksMasterCollectionRef);

  const promotorasCollectionRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'promotoras'), orderBy('name')) : null),
    [firestore]
  );
  const { data: promotoras, isLoading: isLoadingPromotoras } = useCollection<Promotora>(promotorasCollectionRef);

  const promotorasMap = useMemo(() => {
    if (!promotoras) return new Map();
    return new Map(promotoras.map(p => [p.id, p]));
  }, [promotoras]);

  const filteredBanks = useMemo(() => {
    if (!masterBanks) return [];
    return masterBanks.filter(bank => {
        const matchesSearch = searchTerm === '' || bank.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || (bank.categories && bank.categories.includes(filterCategory));
        const matchesPromotora = filterPromotora === 'all' || bank.promotoraId === filterPromotora;
        return matchesSearch && matchesCategory && matchesPromotora;
    });
  }, [masterBanks, searchTerm, filterCategory, filterPromotora]);


  const getCategoryBadgeVariant = (category: BankCategory) => {
    switch (category) {
      case 'CLT': return 'default';
      case 'FGTS': return 'secondary';
      case 'GOV': return 'outline';
      case 'INSS': return 'destructive';
      case 'Inserção': return 'default';
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
      promotoraId: newBankPromotoraId === 'none' ? undefined : newBankPromotoraId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(masterBankCollection, newBankData);

    createActivityLog(firestore, user.email || 'unknown', {
      type: 'CREATE',
      description: `Adicionou o banco: ${newBankName.trim()}`,
    });

    // Reset form
    setNewBankName('');
    setNewBankLogoUrl('');
    setNewBankCategories([]);
    setNewBankPromotoraId(undefined);

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
    promotoraId?: string;
  }) => {
    if (!firestore || !selectedBank || !user) return;

    const bankMasterRef = doc(firestore, 'bankStatuses', selectedBank.id);

    try {
      await updateDoc(bankMasterRef, { ...updatedData, updatedAt: serverTimestamp() });

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
            Insira os detalhes do banco para adicioná-lo ao sistema.
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
              <div className="space-y-2">
                <Label htmlFor="promotora-select">Promotora</Label>
                <Select value={newBankPromotoraId} onValueChange={setNewBankPromotoraId}>
                    <SelectTrigger id="promotora-select">
                        <SelectValue placeholder="Selecione uma promotora (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {isLoadingPromotoras ? (
                            <SelectItem value="loading" disabled>Carregando...</SelectItem>
                        ) : (
                            promotoras?.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categorias</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-4 border rounded-md">
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
          <CardTitle>Bancos Cadastrados</CardTitle>
          <CardDescription>
            Visualize e edite todos os bancos cadastrados no sistema.
          </CardDescription>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
             <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome do banco..."
                className="w-full rounded-lg bg-background pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as BankCategory | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {allCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select value={filterPromotora} onValueChange={(value) => setFilterPromotora(value as string | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por Promotora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Promotoras</SelectItem>
                 {promotoras?.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingMasterBanks && (
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          )}
          {!isLoadingMasterBanks && filteredBanks && filteredBanks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>Promotora</TableHead>
                  <TableHead>Categorias</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanks.map((bank) => {
                    const promotora = bank.promotoraId ? promotorasMap.get(bank.promotoraId) : null;
                    return (
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
                                {promotora ? (
                                    <div className="flex items-center gap-2">
                                        {promotora.logoUrl ? (
                                             <Image src={promotora.logoUrl} alt={`${promotora.name} logo`} width={20} height={20} className="h-5 w-5 object-contain rounded-sm"/>
                                        ) : (
                                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <span className="text-xs">{promotora.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground">N/A</span>
                                )}
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
                    );
                })}
              </TableBody>
            </Table>
          ) : (
            !isLoadingMasterBanks && (
              <p className="text-muted-foreground text-sm p-4 text-center">
                Nenhum banco encontrado com os filtros aplicados.
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
          promotoras={promotoras || []}
          onSave={handleUpdateBank}
        />
      )}
    </>
  );
}
