"use client";

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BankChecklistStatus, BankMaster, BankCategory, Promotora } from '@/lib/types';
import { CheckCircle, History, Landmark, RefreshCw, Building, Search, Filter, FileDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCollection, useFirebase, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, getDoc, getDocs, serverTimestamp, writeBatch, query, orderBy, where } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useMemoFirebase } from '@/firebase/provider';
import { createActivityLog } from '@/firebase/user-data';
import { Skeleton } from './ui/skeleton';
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

type CombinedBankStatus = BankMaster & BankChecklistStatus & { priority: 'Alta' | 'Média' | 'Baixa' };

type GroupedBanks = {
  promotora?: Promotora;
  banks: CombinedBankStatus[];
}

const allCategories: BankCategory[] = ['Inserção', 'CLT', 'FGTS', 'GOV', 'INSS', 'Sem Info'];
const localLogoPath = '/logo.png';

export default function BankProposalView() {
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [userRole, setUserRole] = useState<'master' | 'user' | null>(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pendente' | 'Concluído'>('all');
  const [filterCategory, setFilterCategory] = useState<BankCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const userChecklistCollectionRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return collection(firestore, 'users', user.uid, 'bankChecklists');
  }, [firestore, user]);
  const { data: userChecklist, isLoading: isLoadingChecklist } = useCollection<BankChecklistStatus>(userChecklistCollectionRef);

  const [groupedBankData, setGroupedBankData] = useState<GroupedBanks[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Fetch user role
  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
      });
    }
  }, [user, firestore]);

  // Effect to create checklist items for new banks
  useEffect(() => {
    if (!firestore || !user || !masterBanks || !userChecklist) return;

    const checklistIds = new Set(userChecklist.map(item => item.id));
    const banksToAdd = masterBanks.filter(bank => !checklistIds.has(bank.id));

    if (banksToAdd.length > 0) {
        const batch = writeBatch(firestore);
        banksToAdd.forEach(bank => {
            const checklistRef = doc(firestore, 'users', user.uid, 'bankChecklists', bank.id);
            const newChecklistItem: Omit<BankChecklistStatus, 'id' | 'lastCompletedAt' | 'reopenedAt'> = {
                status: 'Pendente',
                insertionDate: null,
                updatedAt: serverTimestamp()
            };
            batch.set(checklistRef, newChecklistItem);
        });
        batch.commit().catch(error => console.error("Error adding new banks to user checklist:", error));
    }
  }, [masterBanks, userChecklist, firestore, user]);

  useEffect(() => {
    if (isLoadingMasterBanks || isLoadingChecklist || !masterBanks || isLoadingPromotoras) {
      setGroupedBankData([]);
      return;
    }

    const checklistMap = new Map(userChecklist?.map(item => [item.id, item]));
    
    // 1. Get only insertion banks
    let filteredBanks = masterBanks.filter(bank => Array.isArray(bank.categories) && bank.categories.includes('Inserção'));
    
    // 2. Combine with user-specific data
    let combined = filteredBanks.map(bank => {
        const checklistStatus = checklistMap.get(bank.id);
        const status = checklistStatus?.status || 'Pendente';
        const insertionDate = checklistStatus?.insertionDate || null;
        return {
            ...bank,
            id: bank.id,
            status: status,
            insertionDate: insertionDate,
            lastCompletedAt: checklistStatus?.lastCompletedAt || null,
            reopenedAt: checklistStatus?.reopenedAt || null,
            updatedAt: checklistStatus?.updatedAt || bank.updatedAt,
            priority: calculatePriority(status, insertionDate),
        };
    });

    // 3. Apply filters
    if (filterStatus !== 'all') {
      combined = combined.filter(bank => bank.status === filterStatus);
    }
    if (filterCategory !== 'all') {
      combined = combined.filter(bank => bank.categories.includes(filterCategory));
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      combined = combined.filter(bank => 
          bank.name.toLowerCase().includes(lowerSearchTerm) ||
          (bank.customId && bank.customId.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // 4. Group by promotora
    const groups: Record<string, GroupedBanks> = {};
    combined.forEach(bank => {
      const promotoraId = bank.promotoraId || 'independent';
      if (!groups[promotoraId]) {
        const promotora = promotoras?.find(p => p.id === bank.promotoraId);
        groups[promotoraId] = { promotora, banks: [] };
      }
      groups[promotoraId].banks.push(bank);
    });

    // Filter out groups with no banks after filtering
    const finalGroups = Object.values(groups).filter(g => g.banks.length > 0);

    // 5. Sort groups
    finalGroups.sort((a, b) => {
        if (a.promotora && b.promotora) return a.promotora.name.localeCompare(b.promotora.name);
        if (a.promotora) return -1;
        if (b.promotora) return 1;
        return 0;
    });

    setGroupedBankData(finalGroups);

  }, [masterBanks, userChecklist, promotoras, isLoadingMasterBanks, isLoadingChecklist, isLoadingPromotoras, filterStatus, filterCategory, searchTerm]);


  const calculatePriority = (status: 'Pendente' | 'Concluído', insertionDate: any): 'Alta' | 'Média' | 'Baixa' => {
      if (status === 'Pendente' || !insertionDate) {
        return 'Média'; 
      }
      const date = insertionDate.toDate ? insertionDate.toDate() : new Date();
      const daysSinceUpdate = differenceInDays(new Date(), date);

      if (daysSinceUpdate >= 2) return 'Alta';
      if (daysSinceUpdate >= 1) return 'Média';
      return 'Baixa';
  };

  const getPriorityBadgeVariant = (priority: 'Alta' | 'Média' | 'Baixa') => {
    switch (priority) {
      case 'Alta': return 'destructive';
      case 'Média': return 'secondary';
      default: return 'outline';
    }
  };

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


  const renderStatus = (status: CombinedBankStatus) => {
    const dateToShow = status.status === 'Concluído' ? status.insertionDate : status.lastCompletedAt;
    const date = dateToShow?.toDate ? dateToShow.toDate() : null;

    switch(status.status) {
        case 'Pendente': 
            return (
                 <div className="flex flex-col">
                    <Badge variant="outline">Pendente</Badge>
                     {date && <span className="text-xs text-muted-foreground mt-1">Última conclusão: {format(date, "dd/MM/yy HH:mm", { locale: ptBR })}</span>}
                </div>
            )
        case 'Concluído': 
            return (
                <div className="flex flex-col">
                    <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-3 w-3"/>Concluído</Badge>
                    {date && <span className="text-xs text-muted-foreground mt-1">{format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>}
                </div>
            );
    }
  }

  const handleToggleStatus = (bankId: string) => {
    if (!user || !firestore) return;
    
    const bankDocRef = doc(firestore, 'users', user.uid, 'bankChecklists', bankId);
    
    const currentBank = groupedBankData.flatMap(g => g.banks).find(b => b.id === bankId);
    if (!currentBank) return;

    const isCompleted = currentBank.status === 'Concluído';
    const newStatus = isCompleted ? 'Pendente' : 'Concluído';
    
    const dataToUpdate: any = {
        status: newStatus,
        updatedAt: serverTimestamp()
    };

    if (newStatus === 'Concluído') {
      dataToUpdate.insertionDate = serverTimestamp();
      dataToUpdate.lastCompletedAt = serverTimestamp();
    } else {
      // It's being reopened
      dataToUpdate.reopenedAt = serverTimestamp();
      dataToUpdate.insertionDate = null; // Clear current insertion date
    }
    
    updateDocumentNonBlocking(bankDocRef, dataToUpdate, { merge: true });

    createActivityLog(firestore, user.email || 'unknown', {
        type: newStatus === 'Concluído' ? 'STATUS_CHANGE' : 'REOPEN',
        description: `Alterou o status de ${currentBank.name} para ${newStatus}`
    });

    toast({
        title: `Status Alterado!`,
        description: `A inserção no banco ${currentBank.name} foi marcada como ${newStatus.toLowerCase()}.`,
    });
  };
  
  const handleCompletePromotora = (group: GroupedBanks) => {
    if (!user || !firestore || !group.promotora) return;

    const banksToUpdate = group.banks.filter(b => b.status === 'Pendente');
    if (banksToUpdate.length === 0) {
        toast({ title: 'Tudo pronto!', description: `Todos os bancos da promotora ${group.promotora.name} já estavam concluídos.` });
        return;
    }

    const batch = writeBatch(firestore);
    banksToUpdate.forEach(bank => {
        const bankDocRef = doc(firestore, 'users', user.uid, 'bankChecklists', bank.id);
        batch.update(bankDocRef, {
            status: 'Concluído',
            insertionDate: serverTimestamp(),
            lastCompletedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    });

    batch.commit().then(() => {
        createActivityLog(firestore, user.email || 'unknown', {
            type: 'STATUS_CHANGE',
            description: `Concluiu todas as inserções pendentes da promotora ${group.promotora!.name}.`
        });
        toast({
            title: `Promotora Concluída!`,
            description: `${banksToUpdate.length} inserções da promotora ${group.promotora!.name} foram marcadas como "Concluído".`
        });
    }).catch(error => {
        console.error("Error completing promotora:", error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível concluir as inserções da promotora.' });
    });
  }

  const handleResetChecklist = async () => {
    if (!firestore || !user) return;
    setIsResetting(true);

    try {
        const usersRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const batch = writeBatch(firestore);
        
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const checklistRef = collection(firestore, 'users', userId, 'bankChecklists');
            const checklistQuery = query(checklistRef, where('status', '==', 'Concluído'));
            const checklistSnapshot = await getDocs(checklistQuery);

            checklistSnapshot.forEach(checkDoc => {
                const docRef = doc(firestore, 'users', userId, 'bankChecklists', checkDoc.id);
                const updateData = {
                    status: 'Pendente',
                    insertionDate: null,
                    reopenedAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };
                batch.update(docRef, updateData);
            });
        }

        await batch.commit();

        createActivityLog(firestore, user.email || 'unknown', {
            type: 'REOPEN',
            description: `Reiniciou o checklist diário para todos os usuários.`
        });

        toast({
            title: 'Checklist Reiniciado!',
            description: 'Todos os itens concluídos foram redefinidos para "Pendente", mantendo o histórico da última conclusão.'
        });

    } catch (error: any) {
        // Instrument with contextual error
        const permissionError = new FirestorePermissionError({
            path: 'users', // The path that is likely failing (listing all users)
            operation: 'list', // The operation is listing users
        });
        errorEmitter.emit('permission-error', permissionError);

        toast({
            variant: 'destructive',
            title: 'Falha ao Reiniciar',
            description: 'Ocorreu um erro ao reiniciar o checklist. Verifique as permissões.'
        });
    } finally {
        setIsResetting(false);
    }
}

  const isLoading = isLoadingMasterBanks || isLoadingChecklist || isLoadingPromotoras;


  const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
          if (!url) {
            reject(new Error("URL is empty"));
            return;
          }
          const img = new window.Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          
          if (url.startsWith('/')) {
              img.src = window.location.origin + url;
          } else {
              img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
          }
      });
  };

  const handleGenerateReport = async () => {
    const completedBanks = groupedBankData.flatMap(g => g.banks).filter(b => b.status === 'Concluído');
    
    if (completedBanks.length === 0) {
        toast({ title: "Nenhum dado para exportar", description: "Não há bancos concluídos para gerar o relatório." });
        return;
    }
    
    setIsGeneratingReport(true);
    const docPDF = new jsPDF() as jsPDFWithAutoTable;

    const promotorasMap = new Map(promotoras?.map(p => [p.id, p.name]));
    
    const body = await Promise.all(completedBanks.map(async (bank) => {
        let logoImage: HTMLImageElement | null = null;
        if (bank.logoUrl) {
            try {
                logoImage = await loadImage(bank.logoUrl);
            } catch (e) {
                console.error("Error loading image for PDF:", e);
            }
        }
        return {
            bankName: bank.name,
            logo: logoImage,
            promotora: bank.promotoraId ? (promotorasMap.get(bank.promotoraId) || 'N/A') : 'Independente',
            date: bank.insertionDate ? format(bank.insertionDate.toDate(), 'dd/MM/yyyy HH:mm:ss') : 'N/A'
        };
    }));

    const companyLogoImage = await loadImage(localLogoPath).catch(() => undefined);

    docPDF.autoTable({
        head: [['Banco', 'Promotora', 'Data da Conclusão']],
        body: body.map(item => [item.logo ? '' : item.bankName, item.promotora, item.date]),
        didDrawCell: (data) => {
            if (data.column.index === 0 && data.row.section === 'body') {
                const item = body[data.row.index];
                if (item.logo) {
                    const cell = data.cell;
                    const aspectRatio = item.logo.naturalWidth / item.logo.naturalHeight;
                    const imgHeight = cell.height - 4;
                    const imgWidth = imgHeight * aspectRatio;
                    const x = cell.x + (cell.width - imgWidth) / 2;
                    const y = cell.y + 2;
                    docPDF.addImage(item.logo, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
                }
            }
        },
        willDrawPage: (data) => {
            const pageMargin = 14;
            const pageWidth = docPDF.internal.pageSize.getWidth();
            
            docPDF.setFontSize(18);
            docPDF.setFont('helvetica', 'bold');
            docPDF.text('Relatório Diário de Inserções', pageMargin, 23);
            
            docPDF.setFontSize(10);
            docPDF.setFont('helvetica', 'normal');
            docPDF.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageMargin, 28);
            
            if (companyLogoImage) {
                const logoHeight = 25; 
                const aspectRatio = companyLogoImage.naturalWidth / companyLogoImage.naturalHeight;
                const logoWidth = logoHeight * aspectRatio;
                const logoX = pageWidth - logoWidth - pageMargin;
                const logoY = 10;
                docPDF.addImage(companyLogoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
            }
        },
        rowPageBreak: 'auto',
        bodyStyles: { minCellHeight: 12, valign: 'middle' },
        headStyles: { fillColor: [22, 22, 22] },
        margin: { top: 35 },
    });
    
    docPDF.save(`relatorio_concluidos_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    setIsGeneratingReport(false);
  }

  const renderGroup = (group: GroupedBanks) => {
    const total = group.banks.length;
    const completed = group.banks.filter(b => b.status === 'Concluído').length;
    const allCompleted = total > 0 && total === completed;

    return (
      <AccordionItem value={group.promotora?.id || 'independent'} key={group.promotora?.id || 'independent'}>
        <div className="flex items-center justify-between w-full pr-4 py-2 border-b">
           <AccordionTrigger className="hover:no-underline flex-1 py-0">
              <div className="flex items-center gap-4">
                  {group.promotora?.logoUrl ? (
                     <Image src={group.promotora.logoUrl} alt={`${group.promotora.name} logo`} width={32} height={32} className="h-8 w-8 object-contain rounded-md" />
                  ) : (
                     <div className="h-8 w-8 flex items-center justify-center bg-muted rounded-md">
                       <Building className="h-5 w-5 text-muted-foreground" />
                     </div>
                  )}
                  <div>
                      <h3 className="text-lg font-semibold text-left">{group.promotora?.name || 'Bancos Independentes'}</h3>
                      <p className="text-sm text-muted-foreground text-left">{completed} de {total} concluídos</p>
                  </div>
              </div>
          </AccordionTrigger>

          {group.promotora && (
              <Button
                  size="sm"
                  variant={allCompleted ? "secondary" : "default"}
                  onClick={(e) => { e.stopPropagation(); handleCompletePromotora(group); }}
                  disabled={allCompleted}
                  className="ml-4"
              >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {allCompleted ? 'Promotora Concluída' : 'Concluir Promotora'}
              </Button>
          )}
        </div>
        <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>Outras Categorias</TableHead>
                  <TableHead>Status e Data da Última Atualização</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.banks.map(bank => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {bank.logoUrl ? (
                          <Image src={bank.logoUrl} alt={`${bank.name} logo`} width={24} height={24} className="h-6 w-6 object-contain"/>
                        ) : (
                          <Landmark className="h-6 w-6 text-muted-foreground" />
                        )}
                        <div className="flex flex-col">
                          <span>{bank.name}</span>
                           {bank.customId && (
                                <span className="text-xs text-muted-foreground font-mono">
                                    (ID: {bank.customId})
                                </span>
                           )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {bank.categories?.filter(c => c !== 'Inserção').map(cat => (
                          <Badge key={cat} variant={getCategoryBadgeVariant(cat)}>{cat}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{renderStatus(bank)}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(bank.priority)}>{bank.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleStatus(bank.id)}
                      >
                        {bank.status === 'Pendente' ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2"/>
                            Concluir
                          </>
                        ) : (
                          <>
                            <History className="h-4 w-4 mr-2"/>
                            Reabrir
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle>Checklist Diário de Inserções</CardTitle>
                <CardDescription className="mt-2">
                    Controle diário da inserção de propostas nos sistemas bancários. Apenas bancos marcados com a categoria "Inserção" são exibidos aqui.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleGenerateReport} disabled={isGeneratingReport}>
                  <FileDown className={`mr-2 h-4 w-4 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                  {isGeneratingReport ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
                {userRole === 'master' && (
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={isResetting}>
                          <RefreshCw className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                          {isResetting ? 'Reiniciando...' : 'Reiniciar Checklist'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá redefinir o status de **todos** os bancos "Concluído" para "Pendente" para **todos os usuários**, mantendo a data da última conclusão. Isso não pode ser desfeito.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetChecklist}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                )}
              </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome ou ID..."
                className="w-full rounded-lg bg-background pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                </div>
                <div className='flex gap-2'>
                    <Button variant={filterStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('all')}>Todos</Button>
                    <Button variant={filterStatus === 'Pendente' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('Pendente')}>Pendentes</Button>
                    <Button variant={filterStatus === 'Concluído' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('Concluído')}>Concluídos</Button>
                </div>
            </div>
             <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as BankCategory | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {allCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? ( 
             <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
          ) : groupedBankData.length > 0 ? (
            <Accordion type="multiple" className="w-full" defaultValue={groupedBankData.map(g => g.promotora?.id || 'independent')}>
              {groupedBankData.map(group => renderGroup(group))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco encontrado com os filtros aplicados. Tente uma busca diferente.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
