'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirebase, useFirestore } from '@/firebase';
import Header from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';


export default function PerfilPage() {
  const router = useRouter();
  const { user, isUserLoading, auth } = useFirebase();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (user?.displayName) {
        setDisplayName(user.displayName);
    }
  }, [user, isUserLoading, router]);


  const handleSaveProfile = async () => {
    if (!user || !auth.currentUser) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
        return;
    }
    if (displayName.trim().length < 3) {
        toast({ variant: 'destructive', title: 'Erro', description: 'O nome de exibição deve ter pelo menos 3 caracteres.'});
        return;
    }

    setIsSaving(true);
    try {
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });

        // Update Firestore profile
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, { displayName: displayName.trim() });

        toast({ title: 'Sucesso!', description: 'Seu perfil foi atualizado.'});
        // We might need to force a reload of the user object in useUser hook or just reload the page
        router.refresh();
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar seu perfil.'});
    } finally {
        setIsSaving(false);
    }
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:gap-8">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>Atualize suas informações pessoais.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />}
                        <AvatarFallback className="text-3xl">
                            {user.email?.[0].toUpperCase() ?? 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                        <h2 className="text-2xl font-bold">{user.displayName || 'Usuário'}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="displayName">Nome de Exibição</Label>
                    <Input 
                        id="displayName" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Como você quer ser chamado?"
                    />
                </div>
                 <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
