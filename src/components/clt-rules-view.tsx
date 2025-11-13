'use client';

import { useState, useMemo } from 'react';
import NextImage from 'next/image';
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
import { format } from 'date-fns';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

interface CltRulesViewProps {
  userRole: 'master' | 'user' | null;
}

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

  const handleExportAllToPDF = async (banksToExport: BankMaster[]) => {
    if (!firestore || banksToExport.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhum banco CLT para exportar',
        description: 'Não há bancos com a categoria "CLT" para gerar o relatório.',
      });
      return;
    }
  
    setIsExporting(true);

    const dataForPdf: BankDataForPDF[] = await Promise.all(
        banksToExport.map(async (bank: BankMaster) => {
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
  
    const fileName = `RegrasCLT_Consolidado_${format(new Date(), 'dd-MM-yyyy_HH-mm-ss')}.pdf`;
    doc.save(fileName);
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
            <Button variant="outline" size="sm" onClick={() => handleExportAllToPDF(cltBanks)} disabled={isExporting}>
              <FileDown className="mr-2 h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Exportar Comparativo (PDF)'}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && (
              <p className="text-muted-foreground text-sm p-4 text-center">
                Nenhum banco com a categoria 'CLT' encontrado.
              </p>
            )
          )}
        </CardContent>
      </Card>
      {selectedBank && (
        <CltRulesManagerModal
          bank={selectedBank}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userRole={userRole}
        />
      )}
    </>
  );
}
