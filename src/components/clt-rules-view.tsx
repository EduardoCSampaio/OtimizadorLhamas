'use client';

<<<<<<< HEAD
import { useState, useMemo } from 'react';
import NextImage from 'next/image';
=======
import { useState } from 'react';
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
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
<<<<<<< HEAD
<<<<<<< HEAD
import { Button } from '@/components/ui/button';
import { BookCopy, Settings, Landmark, FileDown } from 'lucide-react';
import { useCollection, useFirebase } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { BankMaster, CLTRule } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import CltRulesManagerModal from './clt-rules-manager-modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}
=======
import { Input } from '@/components/ui/input';
=======
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
import { Button } from '@/components/ui/button';
import { BookCopy, Settings, Landmark, FileDown } from 'lucide-react';
import { useCollection, useFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { BankMaster, CLTRule } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
<<<<<<< HEAD
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
} from '@/components/ui/alert-dialog';
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
=======
import CltRulesManagerModal from './clt-rules-manager-modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

<<<<<<< HEAD
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
=======
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}
>>>>>>> bf8965e (Ok, quero que tenha o botão de exportar PDF para poder exportar TODAS as)

interface CltRulesViewProps {
  userRole: 'master' | 'user' | null;
}

<<<<<<< HEAD
const ruleOrder = [
    'Situação', 'Idade', 'Margem e Segurança', 'Limites', 'Prazo', 
    'Empréstimos', 'Tempo Empresa', 'Tempo CNPJ', 'Funcionários na Empresa'
];

type BankDataForPDF = {
    bank: BankMaster;
    rules: Record<string, string>;
    logoImage?: HTMLImageElement;
}

const localLogoPath = '/logo.png';


export default function CltRulesView({ userRole }: CltRulesViewProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [selectedBank, setSelectedBank] = useState<BankMaster | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isMaster = userRole === 'master';

  const bankStatusesCollectionRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'bankStatuses'), orderBy('name')) : null),
    [firestore]
  );

  const { data: banks, isLoading } =
    useCollection<BankMaster>(bankStatusesCollectionRef);
    
  const cltBanks = useMemo(() => {
    return banks?.filter(bank => Array.isArray(bank.categories) && bank.categories.includes('CLT')) || [];
  }, [banks]);


  const handleManageRules = (bank: BankMaster) => {
    setSelectedBank(bank);
    setIsModalOpen(true);
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
          if (!url) {
              reject(new Error("URL is empty or null."));
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

  const handleExportAllToPDF = async () => {
    if (!firestore || !banks || banks.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhum banco para exportar',
        description: 'Não há bancos cadastrados no sistema.',
      });
      return;
    }
  
    setIsExporting(true);

    const banksCopy: BankMaster[] = JSON.parse(JSON.stringify(banks));

    const dataForPdf: BankDataForPDF[] = await Promise.all(
        banksCopy.map(async (bank: BankMaster) => {
            let logoImage: HTMLImageElement | undefined = undefined;
            if (bank.logoUrl) {
                try {
                    logoImage = await loadImage(bank.logoUrl);
                } catch (e) {
                    console.error(`Could not load image for ${bank.name}:`, e);
                }
            }

            const rulesSnapshot = await getDocs(collection(firestore, 'bankStatuses', bank.id, 'cltRules'));
            const rules: Record<string, string> = {};
            rulesSnapshot.docs.forEach(doc => {
                const rule = doc.data() as CLTRule;
                rules[rule.ruleName] = rule.ruleValue;
            });
            
            return { bank, rules, logoImage };
        })
    );
     
    const companyLogoImage = await loadImage(localLogoPath).catch(() => undefined);
    
    dataForPdf.sort((a, b) => a.bank.name.localeCompare(b.bank.name));
    
    const doc = new jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;

    const head = [['Bancos', ...ruleOrder]];
    const body = dataForPdf.map(bankData => {
        const row : (string | null)[] = [ bankData.logoImage ? null : bankData.bank.name ];
        ruleOrder.forEach(ruleName => {
            row.push(bankData.rules[ruleName] || 'Não avaliado');
        });
        return row;
    });

    const headerHeight = 30;
  
    doc.autoTable({
        head: head,
        body: body,
        theme: 'grid',
        avoidRowSplit: true,
        headStyles: { 
            fillColor: [22, 22, 22],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
        },
        styles: {
            fontSize: 8,
            cellPadding: 2,
            valign: 'middle',
            halign: 'center',
            textColor: [0, 0, 0],
        },
        columnStyles: {
            0: { fontStyle: 'bold', minCellWidth: 40, halign: 'left' }
        },
        didParseCell: (data) => {
            if (data.column.index === 0 && data.row.section === 'body') {
                 data.cell.styles.minCellHeight = 20;
            }
        },
        didDrawCell: (data) => {
            if (data.column.index === 0 && data.row.section === 'body') {
                const bankData = dataForPdf[data.row.index];
                if (bankData?.logoImage) {
                    const img = bankData.logoImage;
                    const cell = data.cell;
                    const cellPadding = 2;

                    const availableWidth = cell.width - (2 * cellPadding);
                    const availableHeight = cell.height - (2 * cellPadding);
                    const aspectRatio = img.naturalWidth / img.naturalHeight;

                    let imgWidth, imgHeight;

                    if ((availableWidth / aspectRatio) <= availableHeight) {
                        imgWidth = availableWidth;
                        imgHeight = imgWidth / aspectRatio;
                    } else {
                        imgHeight = availableHeight;
                        imgWidth = imgHeight * aspectRatio;
                    }
                    
                    const x = cell.x + (cell.width - imgWidth) / 2;
                    const y = cell.y + (cell.height - imgHeight) / 2;
                    
                    doc.addImage(img, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
                } else if (bankData?.bank) {
                    const text = bankData.bank.name;
                    doc.text(text, data.cell.x + 2, data.cell.y + data.cell.height / 2, {
                        baseline: 'middle'
                    });
                }
            }
        },
        willDrawCell: (data) => {
            if (data.column.index === 0 && data.row.section === 'body') {
                 if (dataForPdf[data.row.index]?.logoImage) {
                    data.cell.text = '';
                }
            }
        },
        didDrawPage: (data) => {
            const pageMargin = 14;
            const pageWidth = doc.internal.pageSize.getWidth();

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Crédito do Trabalhador', pageMargin, 23);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Confira as atualizações e oportunidades', pageMargin, 28);

            if (companyLogoImage) {
                const logoHeight = 25; 
                const aspectRatio = companyLogoImage.naturalWidth / companyLogoImage.naturalHeight;
                const logoWidth = logoHeight * aspectRatio;
                const logoX = pageWidth - logoWidth - pageMargin;
                const logoY = 10;
                doc.addImage(companyLogoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
            }

            const pageCount = (doc.internal as any).pages.length > 1 ? (doc.internal as any).getNumberOfPages() : 1;
            doc.setFontSize(10);
            const text = `Página ${data.pageNumber} de ${pageCount}`;
            const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
            const textX = (pageWidth - textWidth) / 2;
            doc.text(text, textX, doc.internal.pageSize.getHeight() - 10);
        },
        margin: { top: headerHeight + 10 }
    });
  
    doc.save(`regras_clt_consolidado.pdf`);
    setIsExporting(false);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className='flex items-center gap-3'>
                <BookCopy className="h-6 w-6 text-primary" />
                <div>
                <CardTitle>Regras de Negócio - CLT</CardTitle>
                <CardDescription>
                    {isMaster
                    ? 'Gerencie as regras de negócio para os bancos da categoria CLT.'
                    : 'Consulte as regras de negócio para os bancos da categoria CLT.'}
                </CardDescription>
                </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportAllToPDF} disabled={isExporting}>
              <FileDown className="mr-2 h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Exportar Tudo (PDF)'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Carregando bancos...</p>}
          {!isLoading && cltBanks && cltBanks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cltBanks?.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">
                       <div className="flex items-center gap-3">
                        {bank.logoUrl ? (
                          <NextImage src={bank.logoUrl} alt={`${bank.name} logo`} width={24} height={24} className="h-6 w-6 object-contain"/>
                        ) : (
                          <Landmark className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span>{bank.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageRules(bank)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        {isMaster ? 'Gerenciar Regras' : 'Visualizar Regras'}
                      </Button>
                    </TableCell>
=======
export default function CltRulesView({ userRole }: CltRulesViewProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [selectedBank, setSelectedBank] = useState<BankMaster | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isMaster = userRole === 'master';

  const bankStatusesCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'bankStatuses') : null),
    [firestore]
  );

  const { data: banks, isLoading } =
    useCollection<BankMaster>(bankStatusesCollectionRef);

  const sortedBanks = banks?.sort((a, b) => a.name.localeCompare(b.name));

  const handleManageRules = (bank: BankMaster) => {
    setSelectedBank(bank);
    setIsModalOpen(true);
  };

  const generatePdfContent = (doc: jsPDFWithAutoTable, finalY: number) => {
      // Footer
      const pageCount = doc.internal.pages.length - 1; // jsPDF-autotable adds pages
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        const text = `Página ${i} de ${pageCount}`;
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
        const textX = (doc.internal.pageSize.getWidth() - textWidth) / 2;
        doc.text(text, textX, doc.internal.pageSize.getHeight() - 10);
      }
      return finalY;
  };

  const handleExportAllToPDF = async () => {
    if (!firestore || !sortedBanks || sortedBanks.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhum banco para exportar',
        description: 'Não há bancos cadastrados no sistema.',
      });
      return;
    }

    setIsExporting(true);
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Add logo placeholder
    try {
      const response = await fetch('/logo.png');
      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onloadend = resolve;
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const base64data = reader.result as string;
        doc.addImage(base64data, 'PNG', 15, 10, 30, 15);
      }
    } catch (error) {
       console.warn("Logo not found at /logo.png, skipping.");
    }
    
    // Add title
    doc.setFontSize(22);
    doc.text('Regras de Negócio Consolidadas - CLT', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });

    let finalY = 40; // Start position for the first table

    for (const bank of sortedBanks) {
        const cltRulesCollectionRef = collection(firestore, 'bankStatuses', bank.id, 'cltRules');
        const rulesSnapshot = await getDocs(cltRulesCollectionRef);
        const cltRules = rulesSnapshot.docs.map(doc => doc.data() as CLTRule);

        if (cltRules.length > 0) {
            // Add a separator space if it's not the first bank
            if (finalY > 40) {
                finalY += 5; 
            }

            // Check if there is enough space for the title and table header
            if (finalY + 20 > doc.internal.pageSize.getHeight()) {
              doc.addPage();
              finalY = 20;
            }

            doc.setFontSize(14);
            doc.text(bank.name, 14, finalY);
            finalY += 5;

            doc.autoTable({
                startY: finalY,
                head: [['Regra', 'Valor']],
                body: cltRules.map(rule => [rule.ruleName, rule.ruleValue]),
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] }, // Blue
                didDrawPage: (data) => {
                    // We handle footer generation at the end
                }
            });

            // Update finalY to the position after the table
            finalY = (doc as any).lastAutoTable.finalY;
        }
    }

    generatePdfContent(doc, finalY);
    doc.save(`regras_clt_consolidado.pdf`);
    setIsExporting(false);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className='flex items-center gap-3'>
                <BookCopy className="h-6 w-6 text-primary" />
                <div>
                <CardTitle>Regras de Negócio - CLT</CardTitle>
                <CardDescription>
                    {isMaster
                    ? 'Gerencie as regras de negócio para cada banco.'
                    : 'Consulte as regras de negócio para cada banco.'}
                </CardDescription>
                </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportAllToPDF} disabled={isExporting}>
              <FileDown className="mr-2 h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Exportar Tudo (PDF)'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Carregando bancos...</p>}
          {!isLoading && banks && banks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
<<<<<<< HEAD
                {sortedRules?.map((rule) => (
                  <TableRow key={rule.id}>
                    {editingRuleId === rule.id ? (
                      <>
                        <TableCell>
                            <Input value={editingRuleName} onChange={e => setEditingRuleName(e.target.value)} />
                        </TableCell>
                        <TableCell>
                            <Input value={editingRuleValue} onChange={e => setEditingRuleValue(e.target.value)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className='flex gap-2 justify-end'>
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateRule(rule.id)}>
                                <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{rule.ruleName}</TableCell>
                        <TableCell>{rule.ruleValue}</TableCell>
                        {isMaster && (
                          <TableCell className="text-right">
                            <div className='flex gap-2 justify-end'>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Essa ação não pode ser desfeita. Isso removerá permanentemente a regra
                                        "{rule.ruleName}".
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteRule(rule.id)}>
                                        Continuar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                          </TableCell>
                        )}
                      </>
                    )}
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
=======
                {sortedBanks?.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-muted-foreground" />
                      {bank.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageRules(bank)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        {isMaster ? 'Gerenciar Regras' : 'Visualizar Regras'}
                      </Button>
                    </TableCell>
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && (
              <p className="text-muted-foreground text-sm p-4 text-center">
<<<<<<< HEAD
<<<<<<< HEAD
                Nenhum banco com a categoria 'CLT' encontrado.
=======
                {isMaster
                  ? 'Nenhuma regra CLT adicionada. Comece adicionando uma acima.'
                  : 'Nenhuma regra CLT definida no momento.'}
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
=======
                Nenhum banco cadastrado no sistema.
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
              </p>
            )
          )}
        </CardContent>
      </Card>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
      {selectedBank && (
        <CltRulesManagerModal
          bank={selectedBank}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userRole={userRole}
        />
      )}
<<<<<<< HEAD
=======
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
=======
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
    </>
  );
}
