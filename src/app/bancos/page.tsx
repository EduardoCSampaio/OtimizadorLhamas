'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import Header from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import BankManagementView from '@/components/bank-management-view';
import { doc, getDoc } from 'firebase/firestore';

export default function BancosPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [userRole, setUserRole] = useState<'master' | 'user' | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const role = docSnap.data().role;
          setUserRole(role);
          if (role !== 'master') {
            // Redirect non-master users away from this page
            router.push('/');
          }
        } else {
          // If profile doesn't exist, assume 'user' role and redirect
           router.push('/');
        }
        setIsLoadingRole(false);
      });
    } else if (!isUserLoading) {
        setIsLoadingRole(false);
    }
  }, [user, isUserLoading, router, firestore]);

  const showLoadingSkeleton = isUserLoading || isLoadingRole;

  if (showLoadingSkeleton) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </main>
      </div>
    );
  }

  // Only render the management view if the user is a master
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {userRole === 'master' ? (
          <BankManagementView />
        ) : (
           <div className="text-center py-10">
                <p className="text-lg text-muted-foreground">Você não tem permissão para acessar esta página.</p>
            </div>
        )}
      </main>
    </div>
  );
}
