'use client'

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { BankMaster, CLTRule } from '@/lib/types';
import { useCollection, useFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, orderBy, query } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { PlusCircle, Trash2, Edit, Save, XCircle, FileDown, BookUp } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

interface CltRulesManagerModalProps {
  bank: BankMaster;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'master' | 'user' | null;
}

const defaultRuleNames = [
    'Situação',
    'Idade',
    'Margem e Segurança',
    'Limites',
    'Prazo',
    'Empréstimos',
    'Tempo Empresa',
    'Tempo CNPJ',
    'Funcionários na Empresa'
];

const localLogoPath = '/logo.png';

export default function CltRulesManagerModal({ bank, isOpen, onClose, userRole }: CltRulesManagerModalProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const isMaster = userRole === 'master';

  const cltRulesCollectionRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'bankStatuses', bank.id, 'cltRules'), orderBy('ruleName')) : null),
    [firestore, bank.id]
  );
  
  const { data: cltRules, isLoading } = useCollection<CLTRule>(cltRulesCollectionRef);

  const [newRules, setNewRules] = useState<{ ruleName: string, ruleValue: string }[]>([]);
  const [editingRule, setEditingRule] = useState<CLTRule | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Reset state when modal opens for a new bank
    if (isOpen) {
      setNewRules([]);
      setEditingRule(null);
    }
  }, [isOpen]);

  const handleAddNewRuleInput = () => {
    setNewRules([...newRules, { ruleName: '', ruleValue: '' }]);
  };
  
  const handleNewRuleChange = (index: number, field: 'ruleName' | 'ruleValue', value: string) => {
    const updatedRules = [...newRules];
    updatedRules[index][field] = value;
    setNewRules(updatedRules);
  };
  
  const handleRemoveNewRuleInput = (index: number) => {
    const updatedRules = newRules.filter((_, i) => i !== index);
    setNewRules(updatedRules);
  };

  const handleSaveNewRules = () => {
    if (!cltRulesCollectionRef) return;
    const rulesToSave = newRules.filter(rule => rule.ruleName.trim() !== '' && rule.ruleValue.trim() !== '');
    if (rulesToSave.length === 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Nenhuma regra válida para salvar.' });
      return;
    }

    rulesToSave.forEach(rule => {
      const newRuleData = {
        ...rule,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      addDocumentNonBlocking(cltRulesCollectionRef, newRuleData);
    });

    toast({ title: 'Sucesso!', description: `${rulesToSave.length} nova(s) regra(s) salva(s) para ${bank.name}.` });
    setNewRules([]);
  };
  
  const handleUpdateRule = () => {
    if (!editingRule || !firestore) return;

    const ruleDocRef = doc(firestore, 'bankStatuses', bank.id, 'cltRules', editingRule.id);
    updateDocumentNonBlocking(ruleDocRef, {
        ruleName: editingRule.ruleName,
        ruleValue: editingRule.ruleValue,
        updatedAt: serverTimestamp()
    });
    
    toast({ title: 'Regra Atualizada!', description: 'A regra foi atualizada com sucesso.' });
    setEditingRule(null);
  }

  const handleDeleteRule = (ruleId: string) => {
    if (!firestore) return;
    const ruleDocRef = doc(firestore, 'bankStatuses', bank.id, 'cltRules', ruleId);
    deleteDocumentNonBlocking(ruleDocRef);
    toast({ title: 'Regra Removida!', description: 'A regra foi removida com sucesso.' });
  };
  
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
              // Using a CORS proxy for external images
              img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
          }
      });
  };

  const handleExportToPDF = async () => {
    if (!cltRules || cltRules.length === 0) {
      toast({ variant: 'destructive', title: 'Nenhuma regra para exportar', description: 'Não há regras cadastradas para este banco.' });
      return;
    }
    
    setIsExporting(true);
    const docPDF = new jsPDF() as jsPDFWithAutoTable;

    const logoUrl = bank.logoUrl;
    
    let logoImage: HTMLImageElement | null = null;
    if (logoUrl) {
      try {
        logoImage = await loadImage(logoUrl);
      } catch (e) {
        console.error(`Falha ao carregar a imagem para ${bank.name}:`, e);
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar logo',
          description: `Não foi possível carregar a logo para o banco ${bank.name}. A URL pode estar incorreta ou inacessível.`,
        });
      }
    }
    
    generatePdfContent(docPDF, logoImage);
    setIsExporting(false);
  };

  const generatePdfContent = (docPDF: jsPDFWithAutoTable, logoImage: HTMLImageElement | null) => {
      const addHeader = (data: any) => {
        const pageWidth = docPDF.internal.pageSize.getWidth();
        let startY = 15;

        // Draw Bank Logo or Name
        if (logoImage) {
            const maxBoxWidth = 50;
            const maxBoxHeight = 25; 
            const aspectRatio = logoImage.naturalWidth / logoImage.naturalHeight;
            
            let renderWidth, renderHeight;

            if (aspectRatio > (maxBoxWidth / maxBoxHeight)) { 
                renderWidth = maxBoxWidth;
                renderHeight = renderWidth / aspectRatio;
            } else { 
                renderHeight = maxBoxHeight;
                renderWidth = renderHeight * aspectRatio;
            }
            
            const x = (pageWidth - renderWidth) / 2;

            docPDF.addImage(logoImage, 'PNG', x, startY, renderWidth, renderHeight, undefined, 'FAST');
            startY += renderHeight + 5;
        } else {
             docPDF.setFontSize(20);
             docPDF.text(bank.name, pageWidth / 2, startY, { align: 'center' });
             startY += 10;
        }

        docPDF.setFontSize(16);
        docPDF.text(`Regras CLT`, pageWidth / 2, startY, { align: 'center' });
      };

      const addFooter = (data: any) => {
          const pageCount = (docPDF.internal as any).getNumberOfPages ? (docPDF.internal as any).getNumberOfPages() : 1;
          const pageNum = data.pageNumber;
          docPDF.setPage(pageNum);
          docPDF.setFontSize(10);
          const text = `Página ${pageNum} de ${pageCount}`;
          const textWidth = docPDF.getStringUnitWidth(text) * docPDF.getFontSize() / docPDF.internal.scaleFactor;
          docPDF.text(text, (docPDF.internal.pageSize.getWidth() - textWidth) / 2, docPDF.internal.pageSize.getHeight() - 10);
      };
      
      const headerHeight = logoImage ? 55 : 35;

      docPDF.autoTable({
        head: [['Regra', 'Valor']],
        body: cltRules?.map(rule => [rule.ruleName, rule.ruleValue]),
        theme: 'striped',
        avoidRowSplit: true,
        headStyles: { fillColor: [41, 128, 185], textColor: [255,255,255] },
        bodyStyles: { textColor: [0, 0, 0] },
        didDrawPage: (data) => {
            addHeader(data);
            addFooter(data);
        },
        margin: { top: headerHeight }
      });
      
      docPDF.save(`regras_clt_${bank.name.toLowerCase().replace(/ /g, '_')}.pdf`);
  }

  const loadDefaultRules = () => {
    const existingRuleNames = new Set(cltRules?.map(r => r.ruleName) || []);
    const rulesToLoad = defaultRuleNames
        .filter(name => !existingRuleNames.has(name))
        .map(name => ({ ruleName: name, ruleValue: '' }));

    if (rulesToLoad.length === 0) {
        toast({ title: 'Tudo pronto!', description: 'Todas as regras padrão já foram adicionadas para este banco.' });
        return;
    }
    
    setNewRules(prev => [...prev, ...rulesToLoad]);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-4">
             {bank.logoUrl && <NextImage src={bank.logoUrl} alt={`${bank.name} logo`} width={40} height={40} className="h-10 w-10 object-contain rounded-md" />}
            <DialogTitle>Regras CLT para: {bank.name}</DialogTitle>
          </div>
          <DialogDescription>
            <div className="flex justify-between items-center pt-2">
              <span>
                {isMaster ? 'Adicione, edite ou visualize as regras de negócio para este banco.' : 'Visualize as regras de negócio para este banco.'}
              </span>
              <Button variant="outline" size="sm" onClick={handleExportToPDF} disabled={isExporting}>
                <FileDown className="mr-2 h-4 w-4" />
                {isExporting ? 'Exportando...' : 'Exportar PDF'}
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className='flex-grow overflow-y-auto pr-6'>
          <h3 className="text-lg font-semibold mb-2">Regras Atuais</h3>
          {isLoading ? <p>Carregando regras...</p> : (
            cltRules && cltRules.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Regra</TableHead>
                            <TableHead>Valor</TableHead>
                            {isMaster && <TableHead className="text-right">Ações</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cltRules.map(rule => (
                            <TableRow key={rule.id}>
                                {editingRule?.id === rule.id ? (
                                    <>
                                        <TableCell>
                                            <Input value={editingRule.ruleName} onChange={e => setEditingRule({...editingRule, ruleName: e.target.value})} />
                                        </TableCell>
                                        <TableCell>
                                            <Input value={editingRule.ruleValue} onChange={e => setEditingRule({...editingRule, ruleValue: e.target.value})} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={handleUpdateRule}><Save className="h-4 w-4 text-green-500" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingRule(null)}><XCircle className="h-4 w-4 text-red-500" /></Button>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell>{rule.ruleName}</TableCell>
                                        <TableCell>{rule.ruleValue}</TableCell>
                                        {isMaster && (
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => setEditingRule(rule)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </TableCell>
                                        )}
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : <p className="text-sm text-muted-foreground">Nenhuma regra cadastrada para este banco.</p>
          )}

          {isMaster && (
              <>
                <h3 className="text-lg font-semibold mt-6 mb-2">Adicionar Novas Regras</h3>
                <div className="space-y-4">
                  {newRules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input placeholder="Nome da Regra" value={rule.ruleName} onChange={e => handleNewRuleChange(index, 'ruleName', e.target.value)} />
                      <Input placeholder="Valor da Regra" value={rule.ruleValue} onChange={e => handleNewRuleChange(index, 'ruleValue', e.target.value)} />
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveNewRuleInput(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className='flex justify-between items-start'>
                    <div>
                        <Button variant="outline" size="sm" onClick={handleAddNewRuleInput}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Manual
                        </Button>
                        <Button variant="secondary" size="sm" onClick={loadDefaultRules} className="ml-2">
                            <BookUp className="mr-2 h-4 w-4" /> Carregar Padrão
                        </Button>
                    </div>
                    {newRules.length > 0 && (
                        <Button size="sm" onClick={handleSaveNewRules}>
                            <Save className='mr-2 h-4 w-4'/>
                            Salvar Novas Regras
                        </Button>
                    )}
                  </div>
                </div>
              </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
