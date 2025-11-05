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

// Helper to use Google's image proxy
const getProxiedUrl = (url: string) => `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(url)}`;


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
    const doc = new jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;
    
    // Load background image
    const backgroundImageUrl = 'https://images.unsplash.com/photo-1598387993441-2b724565b493?q=80&w=2070';
    let backgroundImageData: string | null = null;
    try {
        const proxiedBgUrl = getProxiedUrl(backgroundImageUrl);
        const bgResponse = await fetch(proxiedBgUrl);
        if (bgResponse.ok) {
            const blob = await bgResponse.blob();
            backgroundImageData = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
    } catch(e) {
        console.warn("Could not load PDF background image.", e);
    }
  
    // 1. Fetch all rules and image data
    const allRulesData = [];
    for (const bank of banks) {
        const cltRulesCollectionRef = collection(firestore, 'bankStatuses', bank.id, 'cltRules');
        const rulesSnapshot = await getDocs(cltRulesCollectionRef);
        const rulesMap: Record<string, string> = {};
        rulesSnapshot.docs.forEach(doc => {
            const rule = doc.data() as CLTRule;
            rulesMap[rule.ruleName] = rule.ruleValue;
        });

        let logoDataUrl = null;
        if (bank.logoUrl) {
            try {
                const proxiedUrl = getProxiedUrl(bank.logoUrl);
                const response = await fetch(proxiedUrl);
                 if (response.ok) {
                    const blob = await response.blob();
                    logoDataUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                }
            } catch (e) {
                console.error(`Failed to fetch logo for ${bank.name}:`, e);
            }
        }
        allRulesData.push({ bankName: bank.name, rules: rulesMap, logo: logoDataUrl, logoUrl: bank.logoUrl });
    }
  
    // 3. Add Main Logo
    let mainLogoData: { data: string, width: number, height: number } | null = null;
    try {
        const proxiedMainLogoUrl = getProxiedUrl('/logo.png');
        const response = await fetch(proxiedMainLogoUrl);
        if (response.ok) {
            const blob = await response.blob();
            const base64data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            const imgProps = doc.getImageProperties(base64data);
            const logoSize = 40; 
            const aspectRatio = imgProps.width / imgProps.height;
            mainLogoData = {
                data: base64data,
                width: logoSize * aspectRatio,
                height: logoSize
            };
        }
    } catch (error) {
         console.warn("Main logo not found at /logo.png, skipping.", error);
    }
      
    // 4. Prepare table data
    const head = [['Bancos', ...ruleOrder]];
    const body = allRulesData.map(bankData => {
        const row : any[] = [{ content: bankData.bankName, styles: { halign: 'center', valign: 'bottom' } }];
        ruleOrder.forEach(ruleName => {
            row.push(bankData.rules[ruleName] || 'Não avaliado');
        });
        return row;
    });
  
    // 5. Generate Table
    doc.autoTable({
        head: head,
        body: body,
        startY: 50,
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
        didDrawCell: (data) => {
            if (data.column.index === 0 && data.row.section === 'body') {
                const bankData = allRulesData[data.row.index];
                 if (bankData && bankData.logo) {
                    const isPng = bankData.logo.startsWith('data:image/png');
                    const extension = isPng ? 'PNG' : 'JPEG';
                    
                    const cellPadding = 2;
                    const containerSize = 20; 
                    
                    const imgProps = doc.getImageProperties(bankData.logo);
                    const aspectRatio = imgProps.width / imgProps.height;

                    let imgWidth, imgHeight;
                    imgWidth = containerSize;
                    imgHeight = containerSize / aspectRatio;
                    if (imgHeight > containerSize) {
                        imgHeight = containerSize;
                        imgWidth = containerSize * aspectRatio;
                    }

                    const x = data.cell.x + (data.cell.width - imgWidth) / 2;
                    const y = data.cell.y + cellPadding; 
                    
                    doc.addImage(bankData.logo as string, extension, x, y, imgWidth, imgHeight, undefined, 'FAST');
                    
                    if (data.cell.textPos) {
                      data.cell.textPos.y = data.cell.y + data.cell.height - cellPadding;
                    }
                }
            }
        },
        didDrawPage: (data) => {
            if (backgroundImageData) {
                const { width, height } = doc.internal.pageSize;
                doc.addImage(backgroundImageData, 'JPEG', 0, 0, width, height, undefined, 'FAST');
            }
             // Header
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('Crédito do Trabalhador', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Confira as atualizações e oportunidades', doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

            if(mainLogoData) {
                doc.addImage(mainLogoData.data, 'PNG', doc.internal.pageSize.getWidth() - (mainLogoData.width + 15), 8, mainLogoData.width, mainLogoData.height, undefined, 'FAST');
            }

            // Footer
            const pageCount = (doc.internal as any).pages.length > 1 ? (doc.internal as any).getNumberOfPages() : 1;
            doc.setFontSize(10);
            const text = `Página ${data.pageNumber} de ${pageCount}`;
            const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
            const textX = (doc.internal.pageSize.getWidth() - textWidth) / 2;
            doc.text(text, textX, doc.internal.pageSize.getHeight() - 10);
        }
    });
  
    // 6. Save
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
                          <Image src={bank.logoUrl} alt={`${bank.name} logo`} width={24} height={24} className="h-6 w-6 object-contain"/>
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
