
'use client';

import { useState } from 'react';
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
    bankName: string;
    rules: Record<string, string>;
    logoUrl?: string;
    logoImage?: HTMLImageElement;
}


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

  const handleManageRules = (bank: BankMaster) => {
    setSelectedBank(bank);
    setIsModalOpen(true);
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (!url || typeof url !== 'string') {
        return reject(new Error('URL da imagem inválida ou ausente.'));
      }
  
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
  
      if (url.startsWith('http')) {
        const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
        img.src = proxiedUrl;
      } else {
        img.src = url;
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
    
    // Fetch all rules first
    const banksAndRulesPromises = banks.map(async (bank) => {
        const cltRulesCollectionRef = collection(firestore, 'bankStatuses', bank.id, 'cltRules');
        const rulesSnapshot = await getDocs(cltRulesCollectionRef);
        const rules: Record<string, string> = {};
        rulesSnapshot.docs.forEach(doc => {
            const rule = doc.data() as CLTRule;
            rules[rule.ruleName] = rule.ruleValue;
        });
        return { bankName: bank.name, rules, logoUrl: bank.logoUrl };
    });
    const banksAndRules = await Promise.all(banksAndRulesPromises);

    // Then load all images
    const imageLoadingPromises = banksAndRules.map(bank => 
        bank.logoUrl 
        ? loadImage(bank.logoUrl)
            .then(img => ({ ...bank, logoImage: img }))
            .catch(e => {
                console.error(`Failed to load image for ${bank.bankName}:`, e);
                toast({
                    variant: "destructive",
                    title: `Erro ao carregar logo`,
                    description: `Não foi possível carregar a logo para ${bank.bankName}.`,
                });
                return { ...bank, logoImage: undefined }; // Proceed without the image
            })
        : Promise.resolve({ ...bank, logoImage: undefined })
    );

    const allBanksData = await Promise.all(imageLoadingPromises);

    allBanksData.sort((a, b) => a.bankName.localeCompare(b.bankName));

    const doc = new jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;

    const head = [['Bancos', ...ruleOrder]];
    const body = allBanksData.map(bankData => {
        const row : any[] = [
            bankData.bankName // Pass name for fallback
        ];
        ruleOrder.forEach(ruleName => {
            row.push(bankData.rules[ruleName] || 'Não avaliado');
        });
        return row;
    });
  
    doc.autoTable({
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { 
            fillColor: [22, 22, 22],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 8,
            cellPadding: 2,
            valign: 'middle',
            halign: 'center'
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40, minCellHeight: 25 }
        },
        didParseCell: (data) => {
            // Remove text if an image will be drawn
            if (data.column.index === 0 && data.row.section === 'body') {
                const bankData = allBanksData[data.row.index];
                if (bankData?.logoImage) {
                    data.cell.text = '';
                }
            }
        },
        didDrawCell: (data) => {
            if (data.column.index === 0 && data.row.section === 'body') {
                const bankData = allBanksData[data.row.index];
                if (bankData?.logoImage) {
                    const img = bankData.logoImage;
                    const cell = data.cell;
                    const cellPadding = 2;
                    const maxImgWidth = cell.width - (2 * cellPadding);
                    const maxImgHeight = 20;

                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    let imgWidth = maxImgWidth;
                    let imgHeight = imgWidth / aspectRatio;

                    if (imgHeight > maxImgHeight) {
                        imgHeight = maxImgHeight;
                        imgWidth = imgHeight * aspectRatio;
                    }

                    const x = cell.x + (cell.width - imgWidth) / 2;
                    const y = cell.y + (cell.height - imgHeight) / 2;
                    
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0);
                        const dataUrl = canvas.toDataURL('image/png');
                        doc.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
                    } catch (e) {
                        console.error(`Failed to add image for ${bankData.bankName}:`, e);
                        // Fallback to text if image adding fails
                        const text = bankData.bankName;
                        doc.text(text, cell.x + cell.width / 2, cell.y + cell.height / 2, { baseline: 'middle', align: 'center' });
                    }
                }
            }
        },
        didDrawPage: (data) => {
            // Header
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('Crédito do Trabalhador', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Confira as atualizações e oportunidades', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

            // Footer
            const pageCount = (doc.internal as any).pages.length > 1 ? (doc.internal as any).getNumberOfPages() : 1;
            doc.setFontSize(10);
            const text = `Página ${data.pageNumber} de ${pageCount}`;
            const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
            const textX = (doc.internal.pageSize.getWidth() - textWidth) / 2;
            doc.text(text, textX, doc.internal.pageSize.getHeight() - 10);
        },
        margin: { top: 30 } // Set top margin to make space for the header
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
                {banks?.map((bank) => (
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
                Nenhum banco cadastrado no sistema.
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

    