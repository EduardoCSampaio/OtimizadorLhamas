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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Edit,
  Trash2,
  Save,
  XCircle,
  BookCopy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useCollection,
  useFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import type { CLTRuleDocument } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
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

interface CltRulesViewProps {
  userRole: 'master' | 'user' | null;
}

export default function CltRulesView({ userRole }: CltRulesViewProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const cltRulesCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'cltRules') : null),
    [firestore]
  );
  const { data: cltRules, isLoading } =
    useCollection<CLTRuleDocument>(cltRulesCollectionRef);

  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleValue, setNewRuleValue] = useState('');

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingRuleName, setEditingRuleName] = useState('');
  const [editingRuleValue, setEditingRuleValue] = useState('');
  
  const isMaster = userRole === 'master';

  const sortedRules = cltRules?.sort((a, b) =>
    a.ruleName.localeCompare(b.ruleName)
  );

  const handleAddRule = () => {
    if (
      newRuleName.trim() === '' ||
      newRuleValue.trim() === '' ||
      !cltRulesCollectionRef
    ) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O nome e o valor da regra não podem estar vazios.',
      });
      return;
    }

    const newRule: Omit<CLTRuleDocument, 'id'> = {
      ruleName: newRuleName,
      ruleValue: newRuleValue,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(cltRulesCollectionRef, newRule);
    setNewRuleName('');
    setNewRuleValue('');
    toast({
      title: 'Regra Adicionada!',
      description: `A regra "${newRuleName}" foi adicionada.`,
    });
  };

  const handleEdit = (rule: CLTRuleDocument) => {
    setEditingRuleId(rule.id);
    setEditingRuleName(rule.ruleName);
    setEditingRuleValue(rule.ruleValue);
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditingRuleName('');
    setEditingRuleValue('');
  };

  const handleUpdateRule = (ruleId: string) => {
    if (!firestore || editingRuleName.trim() === '' || editingRuleValue.trim() === '') return;

    const ruleDocRef = doc(firestore, 'cltRules', ruleId);
    updateDocumentNonBlocking(ruleDocRef, {
        ruleName: editingRuleName,
        ruleValue: editingRuleValue,
        updatedAt: serverTimestamp()
    });

    toast({
      title: 'Regra Atualizada!',
      description: 'A regra foi atualizada com sucesso.',
    });
    handleCancelEdit();
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!firestore) return;
    const ruleDocRef = doc(firestore, 'cltRules', ruleId);
    deleteDocumentNonBlocking(ruleDocRef);
    toast({
      title: 'Regra Removida!',
      description: 'A regra foi removida com sucesso.',
    });
  };

  return (
    <>
      {isMaster && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Adicionar Nova Regra CLT</CardTitle>
            <CardDescription>
              Insira o nome e o valor para uma nova regra.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                type="text"
                placeholder="Nome da Regra (Ex: Tempo de Admissão)"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Valor da Regra (Ex: 6 meses)"
                value={newRuleValue}
                onChange={(e) => setNewRuleValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
              />
              <Button onClick={handleAddRule}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Regra
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookCopy className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Regras de Negócio - CLT</CardTitle>
              <CardDescription>
                Consulte as regras atuais para propostas de clientes CLT.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Carregando regras...</p>}
          {!isLoading && cltRules && cltRules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Regra</TableHead>
                  <TableHead className="w-2/3">Valor</TableHead>
                  {isMaster && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && (
              <p className="text-muted-foreground text-sm p-4 text-center">
                {isMaster
                  ? 'Nenhuma regra CLT adicionada. Comece adicionando uma acima.'
                  : 'Nenhuma regra CLT definida no momento.'}
              </p>
            )
          )}
        </CardContent>
      </Card>
    </>
  );
}
