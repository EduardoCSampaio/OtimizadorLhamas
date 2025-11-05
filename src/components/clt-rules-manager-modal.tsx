'use client'

import { useState, useEffect } from 'react';
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
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { PlusCircle, Trash2, Edit, Save, XCircle } from 'lucide-react';

interface CltRulesManagerModalProps {
  bank: BankMaster;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'master' | 'user' | null;
}

export default function CltRulesManagerModal({ bank, isOpen, onClose, userRole }: CltRulesManagerModalProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const isMaster = userRole === 'master';

  const cltRulesCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'bankStatuses', bank.id, 'cltRules') : null),
    [firestore, bank.id]
  );
  
  const { data: cltRules, isLoading } = useCollection<CLTRule>(cltRulesCollectionRef);

  const [newRules, setNewRules] = useState([{ ruleName: '', ruleValue: '' }]);
  const [editingRule, setEditingRule] = useState<CLTRule | null>(null);

  useEffect(() => {
    // Reset state when modal opens for a new bank
    if (isOpen) {
      setNewRules([{ ruleName: '', ruleValue: '' }]);
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
    setNewRules([{ ruleName: '', ruleValue: '' }]);
  };
  
  const handleUpdateRule = () => {
    if (!editingRule || !cltRulesCollectionRef) return;

    const ruleDocRef = doc(cltRulesCollectionRef, editingRule.id);
    updateDocumentNonBlocking(ruleDocRef, {
        ruleName: editingRule.ruleName,
        ruleValue: editingRule.ruleValue,
        updatedAt: serverTimestamp()
    });
    
    toast({ title: 'Regra Atualizada!', description: 'A regra foi atualizada com sucesso.' });
    setEditingRule(null);
  }

  const handleDeleteRule = (ruleId: string) => {
    if (!cltRulesCollectionRef) return;
    const ruleDocRef = doc(cltRulesCollectionRef, ruleId);
    deleteDocumentNonBlocking(ruleDocRef);
    toast({ title: 'Regra Removida!', description: 'A regra foi removida com sucesso.' });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Regras CLT para: {bank.name}</DialogTitle>
          <DialogDescription>
            {isMaster ? 'Adicione, edite ou visualize as regras de negócio para este banco.' : 'Visualize as regras de negócio para este banco.'}
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
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveNewRuleInput(index)} disabled={newRules.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className='flex justify-between'>
                    <Button variant="outline" size="sm" onClick={handleAddNewRuleInput}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Outra
                    </Button>
                    <Button size="sm" onClick={handleSaveNewRules}>
                        <Save className='mr-2 h-4 w-4'/>
                        Salvar Novas Regras
                    </Button>
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
