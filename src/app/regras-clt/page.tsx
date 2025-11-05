'use client';

<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
=======
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useFirebase } from '@/firebase';
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
=======
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
import Header from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import CltRulesView from '@/components/clt-rules-view';
import { doc, getDoc } from 'firebase/firestore';
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { useState } from 'react';
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
=======
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)

export default function CltRulesPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [userRole, setUserRole] = useState<'master' | 'user' | null>(null);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
        } else {
          // If profile doesn't exist, maybe they just signed up
          // We'll rely on the login page to create it.
          // For now, let's assume a 'user' role to avoid blocking the UI.
          setUserRole('user');
<<<<<<< HEAD
=======
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
=======
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
        }
      });
    }
  }, [user, isUserLoading, router, firestore]);

  if (isUserLoading || !user || !userRole) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
<<<<<<< HEAD
<<<<<<< HEAD
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:gap-8">
            <Skeleton className="h-[300px] w-full" />
=======
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:gap-8">
            <Skeleton className="h-[400px] w-full" />
>>>>>>> d71a7cb (Foi, agora vamos seguir para criação de mais coisas, vamos criar as "Reg)
=======
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:gap-8">
            <Skeleton className="h-[300px] w-full" />
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <CltRulesView userRole={userRole} />
      </main>
    </div>
  );
}
