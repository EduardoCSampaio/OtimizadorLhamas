'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function InstrucoesPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (!isUserLoading) {
            if (!user) {
                router.push('/login');
            } else {
                setIsLoading(false);
            }
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, isUserLoading, router]);

  if (isLoading || isUserLoading) {
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
  
  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-start p-4 md:p-8">
        <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                    <BookOpen className="h-8 w-8" />
                </div>
                <CardTitle>Base de Conhecimento</CardTitle>
                <CardDescription>
                    Um local centralizado para regras, procedimentos e dicas para a inserção de propostas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground">
                    <p>Esta página funcionará como a sua base de conhecimento.</p>
                    <p className="mt-2">Em breve, você poderá adicionar e editar as regras de negócio para cada banco aqui.</p>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
