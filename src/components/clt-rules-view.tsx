'use client';

import { useState } from 'react';
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
import { collection, getDocs } from 'firebase/firestore';
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
