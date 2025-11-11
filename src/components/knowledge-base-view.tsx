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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { BookOpen, Landmark, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useCollection, useFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import type { BankMaster, KnowledgeBaseEntry } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { createActivityLog } from '@/firebase/user-data';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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

interface KnowledgeBaseViewProps {
  userRole: 'master' | 'user' | null;
}

function BankKnowledgeBase({ bank, isMaster, userEmail }: { bank: BankMaster, isMaster: boolean, userEmail: string | null }) {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<KnowledgeBaseEntry | null>(null);
    const [entryTitle, setEntryTitle] = useState('');
    const [entryContent, setEntryContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const knowledgeBaseQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'bankStatuses', bank.id, 'knowledgeBase'), orderBy('createdAt', 'desc')) : null),
        [firestore, bank.id]
    );
    const { data: entries, isLoading } = useCollection<KnowledgeBaseEntry>(knowledgeBaseQuery);

    const openModalForNew = () => {
        setEditingEntry(null);
        setEntryTitle('');
        setEntryContent('');
        setIsModalOpen(true);
    };

    const openModalForEdit = (entry: KnowledgeBaseEntry) => {
        setEditingEntry(entry);
        setEntryTitle(entry.title);
        setEntryContent(entry.content);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEntry(null);
        setEntryTitle('');
        setEntryContent('');
    };

    const handleSave = () => {
        if (!entryTitle || !entryContent || !firestore) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Título e conteúdo são obrigatórios.' });
            return;
        }
        setIsSaving(true);
        if (editingEntry) { // Update
            const entryDocRef = doc(firestore, 'bankStatuses', bank.id, 'knowledgeBase', editingEntry.id);
            updateDocumentNonBlocking(entryDocRef, {
                title: entryTitle,
                content: entryContent,
                updatedAt: serverTimestamp(),
            });
             if (userEmail) createActivityLog(firestore, userEmail, { type: 'UPDATE', description: `Atualizou a instrução "${entryTitle}" para o banco ${bank.name}.` });
            toast({ title: 'Sucesso!', description: 'Instrução atualizada.' });
        } else { // Create
            const collectionRef = collection(firestore, 'bankStatuses', bank.id, 'knowledgeBase');
            addDocumentNonBlocking(collectionRef, {
                title: entryTitle,
                content: entryContent,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            if (userEmail) createActivityLog(firestore, userEmail, { type: 'CREATE', description: `Adicionou a instrução "${entryTitle}" para o banco ${bank.name}.` });
            toast({ title: 'Sucesso!', description: 'Nova instrução adicionada.' });
        }
        setIsSaving(false);
        closeModal();
    };

    const handleDelete = (entry: KnowledgeBaseEntry) => {
        if (!firestore) return;
        const entryDocRef = doc(firestore, 'bankStatuses', bank.id, 'knowledgeBase', entry.id);
        deleteDocumentNonBlocking(entryDocRef);
        if (userEmail) createActivityLog(firestore, userEmail, { type: 'DELETE', description: `Removeu a instrução "${entry.title}" do banco ${bank.name}.` });
        toast({ title: 'Removido!', description: `A instrução "${entry.title}" foi removida.` });
    };

    return (
        <>
            <AccordionItem value={bank.id}>
                <AccordionTrigger>
                    <div className="flex items-center gap-3">
                        {bank.logoUrl ? (
                            <NextImage src={bank.logoUrl} alt={`${bank.name} logo`} width={24} height={24} className="h-6 w-6 object-contain" />
                        ) : (
                            <Landmark className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span className="font-medium">{bank.name}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="p-4 space-y-4">
                        {isMaster && (
                            <div className="text-right">
                                <Button size="sm" onClick={openModalForNew}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Instrução
                                </Button>
                            </div>
                        )}
                        {isLoading && <p>Carregando instruções...</p>}
                        {!isLoading && entries?.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma instrução cadastrada para este banco.</p>
                        )}
                        <div className="space-y-6">
                            {entries?.map(entry => (
                                <Card key={entry.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle>{entry.title}</CardTitle>
                                            {isMaster && (
                                                <div className='flex gap-2'>
                                                    <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => openModalForEdit(entry)}><Edit className="h-4 w-4" /></Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className='h-8 w-8 text-destructive hover:text-destructive'><Trash2 className="h-4 w-4" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Tem certeza que deseja remover a instrução "{entry.title}"? Esta ação não pode ser desfeita.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(entry)}>Remover</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry.content.replace(/\n/g, '<br />') }} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? 'Editar Instrução' : 'Adicionar Nova Instrução'}</DialogTitle>
                        <DialogDescription>
                            {editingEntry ? `Editando instrução para o banco ${bank.name}.` : `Crie uma nova instrução para o banco ${bank.name}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                           <Input
                                id="title"
                                placeholder="Título da Instrução"
                                value={entryTitle}
                                onChange={(e) => setEntryTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Textarea
                                id="content"
                                placeholder="Descreva o passo a passo, regras, dicas, etc."
                                value={entryContent}
                                onChange={(e) => setEntryContent(e.target.value)}
                                className="min-h-[250px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
                        <Button type="submit" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Salvando...' : 'Salvar Instrução'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function KnowledgeBaseView({ userRole }: KnowledgeBaseViewProps) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const isMaster = userRole === 'master';

  const bankStatusesCollectionRef = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'bankStatuses'), orderBy('name')) : null),
    [firestore]
  );
  const { data: banks, isLoading } = useCollection<BankMaster>(bankStatusesCollectionRef);

  return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Base de Conhecimento</CardTitle>
              <CardDescription>
                Consulte e gerencie as regras de negócio e passo-a-passos para cada banco.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
              <div className="space-y-2 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
          )}
          {!isLoading && banks && banks.length > 0 ? (
            <Accordion type="multiple" className="w-full">
                {banks.map((bank) => (
                    <BankKnowledgeBase key={bank.id} bank={bank} isMaster={isMaster} userEmail={user?.email || null} />
                ))}
            </Accordion>
          ) : (
            !isLoading && <p className="text-muted-foreground text-sm p-4 text-center">Nenhum banco encontrado.</p>
          )}
        </CardContent>
      </Card>
  );
}

    