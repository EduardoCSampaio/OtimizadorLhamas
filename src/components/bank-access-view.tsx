'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { KeyRound, Landmark, Link as LinkIcon, Clipboard, Eye, EyeOff, Edit, Save, PlusCircle, Trash2, X, Building, Users, AlertTriangle, Search } from 'lucide-react';
import { useCollection, useFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import type { BankMaster, AccessDetails, LoginCredential, Promotora } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useMemoFirebase } from '@/firebase/provider';


interface AccessItemProps {
  item: { id: string; name: string; logoUrl?: string; };
  collectionPath: 'bankAccessDetails' | 'promotoraAccessDetails';
  children?: React.ReactNode;
}

function AccessItem({ item, collectionPath, children }: AccessItemProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  // Edit state
  const [editLink, setEditLink] = useState('');
  const [editLogins, setEditLogins] = useState<LoginCredential[]>([]);
  const [editRequiresToken, setEditRequiresToken] = useState(false);
  const [editTokenResponsible, setEditTokenResponsible] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const accessDetailsRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid, collectionPath, item.id) : null),
    [firestore, user, item.id, collectionPath]
  );
  const { data: accessDetails, isLoading } = useDoc<AccessDetails>(accessDetailsRef);

  useEffect(() => {
    if (accessDetails) {
      setEditLink(accessDetails.link || '');
      setEditLogins(accessDetails.logins || []);
      setEditRequiresToken(accessDetails.requiresToken || false);
      setEditTokenResponsible(accessDetails.tokenResponsible || '');
    } else {
      setEditLink('');
      setEditLogins([]);
      setEditRequiresToken(false);
      setEditTokenResponsible('');
    }
  }, [accessDetails]);
  
  const hasDetails = accessDetails && (accessDetails.link || (accessDetails.logins && accessDetails.logins.length > 0) || accessDetails.requiresToken);

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: `${fieldName} copiado para a área de transferência.` });
  };

  const toggleShowPassword = (index: number) => {
    setShowPasswords(prev => ({ ...prev, [index]: !prev[index] }));
  };
  
  const handleEditClick = () => {
    setEditLink(accessDetails?.link || '');
    setEditLogins(JSON.parse(JSON.stringify(accessDetails?.logins || [])));
    setEditRequiresToken(accessDetails?.requiresToken || false);
    setEditTokenResponsible(accessDetails?.tokenResponsible || '');
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!accessDetailsRef) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar. Referência de dados inválida.' });
      return;
    }
    
    setIsSaving(true);
    
    const dataToSave: Omit<AccessDetails, 'id'> = {
      link: editLink,
      logins: editLogins.filter(l => l.type.trim() || l.username.trim()),
      requiresToken: editRequiresToken,
      tokenResponsible: editRequiresToken ? editTokenResponsible : '',
      updatedAt: serverTimestamp(),
    };

    setDocumentNonBlocking(accessDetailsRef, dataToSave, { merge: true });

    toast({ title: 'Sucesso!', description: `Acessos para ${item.name} foram salvos.` });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleAddNewLogin = () => {
    setEditLogins([...editLogins, { type: '', username: '', password: '' }]);
  };
  
  const handleLoginChange = (index: number, field: keyof LoginCredential, value: string) => {
    const updatedLogins = [...editLogins];
    updatedLogins[index] = { ...updatedLogins[index], [field]: value };
    setEditLogins(updatedLogins);
  };
  
  const handleRemoveLogin = (index: number) => {
    const updatedLogins = editLogins.filter((_, i) => i !== index);
    setEditLogins(updatedLogins);
  };

  const renderViewMode = () => (
     <div className="p-4 space-y-4">
        {hasDetails ? (
            <>
                {accessDetails.requiresToken && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Necessário Token</AlertTitle>
                        <AlertDescription>
                            Responsável: {accessDetails.tokenResponsible || 'Não informado'}
                        </AlertDescription>
                    </Alert>
                )}
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
                    <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                        <div className='flex-1'>
                        <p className="text-xs text-muted-foreground">Usuário</p>
                        <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">{login.username}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(login.username, 'Usuário')}>
                                <Clipboard className="h-4 w-4" />
                            </Button>
                        </div>
                        </div>
                        <div className='flex-1'>
                        <p className="text-xs text-muted-foreground">Senha</p>
                        <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">
                            {showPasswords[index] ? login.password : '••••••••'}
                            </p>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleShowPassword(index)}>
                                {showPasswords[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(login.password || '', 'Senha')}>
                            <Clipboard className="h-4 w-4" />
                            </Button>
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
            </>
        ) : (
            <p className="text-center text-sm text-muted-foreground py-2">
                Nenhum acesso salvo.
            </p>
        )}
        <Button variant="outline" size="sm" onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" /> 
            {hasDetails ? 'Editar Acessos' : 'Adicionar Acessos'}
        </Button>
    </div>
  );

  const renderEditMode = () => (
    <div className='p-4 space-y-6'>
        <div className="space-y-2">
            <Label htmlFor="bank-link">Link do Portal</Label>
            <Input
            id="bank-link"
            placeholder="https://portal.exemplo.com.br"
            value={editLink}
            onChange={e => setEditLink(e.target.value)}
            />
        </div>
        
        <div className="space-y-4">
            <Label>Credenciais de Acesso</Label>
            {editLogins.map((login, index) => (
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
                    <div className="space-y-1">
                        <Label htmlFor={`login-password-${index}`} className="text-xs">Senha</Label>
                        <Input id={`login-password-${index}`} type="text" placeholder="********" value={login.password || ''} onChange={e => handleLoginChange(index, 'password', e.target.value)} />
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

        <div className="space-y-4 p-3 border rounded-md">
            <div className="space-y-2">
                <Label>Necessita Token?</Label>
                <RadioGroup
                    value={editRequiresToken ? 'yes' : 'no'}
                    onValueChange={(value) => setEditRequiresToken(value === 'yes')}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="token-yes" />
                        <Label htmlFor="token-yes">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="token-no" />
                        <Label htmlFor="token-no">Não</Label>
                    </div>
                </RadioGroup>
            </div>
            {editRequiresToken && (
                 <div className="space-y-2">
                    <Label htmlFor="token-responsible">Responsável pelo Token</Label>
                    <Input
                    id="token-responsible"
                    placeholder="Nome da pessoa"
                    value={editTokenResponsible}
                    onChange={e => setEditTokenResponsible(e.target.value)}
                    />
                </div>
            )}
        </div>

        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelClick} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Acessos'}
            </Button>
        </div>
    </div>
  );

  return (
    <AccordionItem value={item.id}>
      <AccordionTrigger>
        <div className="flex items-center gap-3">
          {item.logoUrl ? (
            <NextImage src={item.logoUrl} alt={`${item.name} logo`} width={24} height={24} className="h-6 w-6 object-contain" />
          ) : (
            <Landmark className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="font-medium">{item.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isEditing ? (
          renderEditMode()
        ) : (
          renderViewMode()
        )}
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

export default function BankAccessView() {
  const { firestore } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all master data
  const banksQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'bankStatuses'), orderBy('name')) : null), [firestore]);
  const { data: allBanks, isLoading: isLoadingBanks } = useCollection<BankMaster>(banksQuery);

  const promotorasQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'promotoras'), orderBy('name')) : null), [firestore]);
  const { data: promotoras, isLoading: isLoadingPromotoras } = useCollection<Promotora>(promotorasQuery);

  const { promotorasWithBanks, independentBanks } = useMemo(() => {
    if (!allBanks || !promotoras) {
      return { promotorasWithBanks: [], independentBanks: [] };
    }
    const promotoraMap = new Map(promotoras.map(p => [p.id, { ...p, banks: [] as BankMaster[] }]));
    const independent: BankMaster[] = [];

    allBanks.forEach(bank => {
      if (bank.promotoraId && promotoraMap.has(bank.promotoraId)) {
        promotoraMap.get(bank.promotoraId)!.banks.push(bank);
      } else {
        independent.push(bank);
      }
    });

    return {
      promotorasWithBanks: Array.from(promotoraMap.values()),
      independentBanks: independent,
    };
  }, [allBanks, promotoras]);
  
  const filteredPromotoras = useMemo(() => {
    if (!searchTerm) return promotorasWithBanks;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return promotorasWithBanks.filter(p => p.name.toLowerCase().includes(lowerCaseSearch));
  }, [promotorasWithBanks, searchTerm]);

  const filteredIndependentBanks = useMemo(() => {
    if (!searchTerm) return independentBanks;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return independentBanks.filter(b => b.name.toLowerCase().includes(lowerCaseSearch));
  }, [independentBanks, searchTerm]);


  const isLoading = isLoadingBanks || isLoadingPromotoras;
  
  const renderBankList = (banks: BankMaster[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-4 border-t">
        {banks.map(bank => (
             <Badge key={bank.id} variant="secondary" className="flex items-center gap-2 py-1">
                {bank.logoUrl ? (
                    <NextImage src={bank.logoUrl} alt={bank.name} width={16} height={16} className="h-4 w-4 object-contain" />
                ) : (
                    <Landmark className="h-4 w-4" />
                )}
                <span className='truncate'>{bank.name}</span>
            </Badge>
        ))}
    </div>
  )


  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
            <KeyRound className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>Meus Acessos</CardTitle>
                <CardDescription>
                Gerencie seus links e credenciais de acesso. Estas informações são privadas e visíveis apenas para você.
                </CardDescription>
            </div>
            </div>
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar promotora ou banco..."
                    className="w-full rounded-lg bg-background pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="space-y-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!isLoading && filteredPromotoras.length > 0 && (
           <div className='p-4'>
             <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                <Building className="h-5 w-5" />
                Acessos por Promotora
             </div>
             <Accordion type="multiple" className="w-full">
                {filteredPromotoras.map(p => (
                    <AccessItem key={p.id} item={p} collectionPath="promotoraAccessDetails">
                       {p.banks.length > 0 && renderBankList(p.banks)}
                    </AccessItem>
                ))}
            </Accordion>
           </div>
        )}
         {!isLoading && filteredIndependentBanks.length > 0 && (
           <div className='p-4'>
             <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                <Users className="h-5 w-5" />
                Bancos Independentes
             </div>
            <Accordion type="multiple" className="w-full">
                {filteredIndependentBanks.map(bank => (
                    <AccessItem key={bank.id} item={bank} collectionPath="bankAccessDetails" />
                ))}
            </Accordion>
           </div>
        )}
         {!isLoading && filteredPromotoras.length === 0 && filteredIndependentBanks.length === 0 && (
             <p className="text-muted-foreground text-sm p-4 text-center">
              {searchTerm ? `Nenhum resultado para "${searchTerm}".` : 'Nenhum banco ou promotora cadastrado no sistema.'}
            </p>
         )}
      </CardContent>
    </Card>
  );
}
