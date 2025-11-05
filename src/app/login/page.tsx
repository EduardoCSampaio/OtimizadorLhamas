'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Banknote } from 'lucide-react';
<<<<<<< HEAD
<<<<<<< HEAD
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile, logUserSignIn } from '@/firebase/user-data';
import { doc, getDoc } from 'firebase/firestore';

=======
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
>>>>>>> 0af121b (File changes)
=======
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from '@/firebase/user-data';

>>>>>>> 91bbab7 (Ok ok, agora vamos as melhorias que eu disse, configuração por usuário,)

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
<<<<<<< HEAD
<<<<<<< HEAD
  const firestore = useFirestore();
=======
>>>>>>> 0af121b (File changes)
=======
  const firestore = useFirestore();
>>>>>>> 91bbab7 (Ok ok, agora vamos as melhorias que eu disse, configuração por usuário,)
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!email || !password) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha email e senha.' });
        return;
    }
    setIsLoading(true);
    try {
<<<<<<< HEAD
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await createUserProfile(firestore, user);
        }
        
        logUserSignIn(firestore, user.email);

=======
        await signInWithEmailAndPassword(auth, email, password);
>>>>>>> 0af121b (File changes)
        toast({ title: 'Sucesso', description: 'Login realizado com sucesso!' });
        router.push('/');
    } catch (error: any) {
        let errorMessage = 'Ocorreu um erro ao fazer login.';
<<<<<<< HEAD
<<<<<<< HEAD
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
=======
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
>>>>>>> 0af121b (File changes)
=======
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
>>>>>>> 91bbab7 (Ok ok, agora vamos as melhorias que eu disse, configuração por usuário,)
            errorMessage = 'Email ou senha inválidos.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'O formato do email é inválido.';
        }
        toast({ variant: 'destructive', title: 'Erro de Login', description: errorMessage });
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };
  
<<<<<<< HEAD
<<<<<<< HEAD
=======
  // This is a simplified sign-up for demonstration. 
  // In a real app, you'd have a separate sign-up page.
>>>>>>> 0af121b (File changes)
=======
>>>>>>> 91bbab7 (Ok ok, agora vamos as melhorias que eu disse, configuração por usuário,)
  const handleSignUp = async () => {
    if (!email || !password) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha email e senha para se cadastrar.' });
        return;
    }
     if (password.length < 6) {
        toast({ variant: 'destructive', title: 'Erro', description: 'A senha deve ter pelo menos 6 caracteres.' });
        return;
    }
    setIsLoading(true);
    try {
<<<<<<< HEAD
<<<<<<< HEAD
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(firestore, userCredential.user);
=======
        await createUserWithEmailAndPassword(auth, email, password);
>>>>>>> 0af121b (File changes)
=======
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(firestore, userCredential.user);
>>>>>>> 91bbab7 (Ok ok, agora vamos as melhorias que eu disse, configuração por usuário,)
        toast({ title: 'Cadastro realizado!', description: 'Você foi cadastrado e logado com sucesso.' });
        router.push('/');
    } catch (error: any) {
        let errorMessage = 'Ocorreu um erro ao se cadastrar.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este email já está em uso. Tente fazer login.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'O formato do email é inválido.';
        }
         else if (error.code === 'auth/weak-password') {
            errorMessage = 'A senha é muito fraca.';
        }
        toast({ variant: 'destructive', title: 'Erro de Cadastro', description: errorMessage });
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <Banknote className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl">Bank Proposal Automation</CardTitle>
          <CardDescription>
            Faça login para acessar seu checklist diário.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleSignIn} disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
           <p className="text-center text-xs text-muted-foreground">
            Não tem uma conta?
          </p>
          <Button variant="outline" className="w-full" onClick={handleSignUp} disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastre-se com Email e Senha'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}