'use client';

<<<<<<< HEAD
import { useState, useMemo } from 'react';
=======
import { useState, useEffect, useMemo } from 'react';
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
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
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BankMaster, BankCategory, Promotora } from '@/lib/types';
import { Landmark, PlusCircle, Edit, Briefcase } from 'lucide-react';
=======
import type { BankMaster, BankCategory } from '@/lib/types';
import { Landmark, PlusCircle, Edit } from 'lucide-react';
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
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
<<<<<<< HEAD
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
=======
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
import { useMemoFirebase } from '@/firebase/provider';
import EditBankModal from './edit-bank-modal';
import { createActivityLog } from '@/firebase/user-data';
import { Skeleton } from './ui/skeleton';

const allCategories: BankCategory[] = ['Inserção', 'CLT', 'FGTS', 'GOV', 'INSS', 'Sem Info'];

export default function BankManagementView() {
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

<<<<<<< HEAD
  // Form state
  const [newBankName, setNewBankName] = useState('');
  const [newBankLogoUrl, setNewBankLogoUrl] = useState('');
  const [newBankCategories, setNewBankCategories] = useState<BankCategory[]>([]);
  const [newBankPromotoraId, setNewBankPromotoraId] = useState<string | undefined>(undefined);
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankMaster | null>(null);

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

=======
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
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)

  const getCategoryBadgeVariant = (category: BankCategory) => {
    switch (category) {
      case 'CLT': return 'default';
      case 'FGTS': return 'secondary';
      case 'GOV': return 'outline';
      case 'INSS': return 'destructive';
<<<<<<< HEAD
      case 'Inserção': return 'default';
=======
      case 'Inserção': return 'default'; // Or choose a specific color
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
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
<<<<<<< HEAD
      promotoraId: newBankPromotoraId === 'none' ? undefined : newBankPromotoraId,
=======
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(masterBankCollection, newBankData);

    createActivityLog(firestore, user.email || 'unknown', {
      type: 'CREATE',
      description: `Adicionou o banco: ${newBankName.trim()}`,
    });

<<<<<<< HEAD
    // Reset form
    setNewBankName('');
    setNewBankLogoUrl('');
    setNewBankCategories([]);
    setNewBankPromotoraId(undefined);

=======
    setNewBankName('');
    setNewBankLogoUrl('');
    setNewBankCategories([]);
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
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
<<<<<<< HEAD
    promotoraId?: string;
=======
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
  }) => {
    if (!firestore || !selectedBank || !user) return;

    const bankMasterRef = doc(firestore, 'bankStatuses', selectedBank.id);

    try {
<<<<<<< HEAD
      await updateDoc(bankMasterRef, { ...updatedData, updatedAt: serverTimestamp() });
=======
      await updateDoc(bankMasterRef, {
        name: updatedData.name,
        logoUrl: updatedData.logoUrl,
        categories: updatedData.categories,
        updatedAt: serverTimestamp(),
      });
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)

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
<<<<<<< HEAD
            Insira os detalhes do banco para adicioná-lo ao sistema.
=======
            Insira os detalhes do banco para adicioná-lo ao sistema. Marque 'Inserção' para
            que ele apareça no checklist diário.
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
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
<<<<<<< HEAD
               <div className="space-y-2">
=======
              <div className="space-y-2">
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
                <Label htmlFor="bank-logo">URL da Logo</Label>
                <Input
                  id="bank-logo"
                  type="text"
                  placeholder="https://.../logo.png"
                  value={newBankLogoUrl}
                  onChange={(e) => setNewBankLogoUrl(e.target.value)}
                />
              </div>
<<<<<<< HEAD
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
=======
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
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
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
<<<<<<< HEAD
          <CardTitle>Bancos Cadastrados</CardTitle>
=======
          <CardTitle>Gerenciamento de Bancos</CardTitle>
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
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
<<<<<<< HEAD
                  <TableHead>Promotora</TableHead>
=======
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
                  <TableHead>Categorias</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
<<<<<<< HEAD
                {masterBanks.map((bank) => {
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
=======
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
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
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
<<<<<<< HEAD
          promotoras={promotoras || []}
=======
>>>>>>> a3e73ad (Nem todos os bancos, fazemos a inserção de dados, isso também seria bom)
          onSave={handleUpdateBank}
        />
      )}
    </>
  );
}
