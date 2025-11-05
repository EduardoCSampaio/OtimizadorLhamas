'use client';

<<<<<<< HEAD
import { doc, setDoc, Firestore, collection, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { addDocumentNonBlocking, setDocumentNonBlocking } from './non-blocking-updates';
import type { Activity } from '@/lib/types';


/**
 * Creates a user profile document in Firestore and logs the sign-up event.
 * @param firestore - The Firestore instance.
 * @param user - The Firebase Auth user object.
 */
export function createUserProfile(firestore: Firestore, user: User) {
  const userRef = doc(firestore, 'users', user.uid);
=======
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { setDocumentNonBlocking } from './non-blocking-updates';

/**
 * Creates a user profile document in Firestore.
 * @param firestore - The Firestore instance.
 * @param user - The Firebase Auth user object.
 */
export function createUserProfile(firestore: Firestore, user: User) {
  const userRef = doc(firestore, 'users', user.uid);

  // Assign 'master' role if the email matches, otherwise 'user'
>>>>>>> 91bbab7 (Ok ok, agora vamos as melhorias que eu disse, configuração por usuário,)
  const role = user.email === 'eduardo.campos@lhamascred.com.br' ? 'master' : 'user';

  const userData = {
    id: user.uid,
    email: user.email,
<<<<<<< HEAD
<<<<<<< HEAD
    displayName: user.displayName || user.email?.split('@')[0],
    role: role,
  };

  // Use the non-blocking update to create the user document
  setDocumentNonBlocking(userRef, userData, { merge: false });

  // Log the sign-up activity
  const logMessage = role === 'master' ? `Usuário Master ${user.email} se cadastrou.` : `Novo usuário ${user.email} se cadastrou.`;
  createActivityLog(firestore, user.email || 'unknown user', {
      type: 'CREATE',
      description: logMessage,
  });
}

/**
 * Logs a user sign-in event.
 * @param firestore - The Firestore instance.
 * @param userEmail - The email of the user signing in.
 */
export function logUserSignIn(firestore: Firestore, userEmail: string | null) {
    if (!userEmail) return;
    createActivityLog(firestore, userEmail, {
        type: 'LOGIN',
        description: `Usuário ${userEmail} fez login.`,
    });
}

/**
 * Creates a generic activity log entry.
 * @param firestore The Firestore instance.
 * @param userEmail The email of the user performing the action.
 * @param activity An object containing the type and description of the activity.
 */
export function createActivityLog(
    firestore: Firestore, 
    userEmail: string, 
    activity: { type: Activity['type'], description: string }
) {
    const activityLogCollection = collection(firestore, 'activityLogs');
    const activityData: Omit<Activity, 'id'> = {
        ...activity,
        userEmail: userEmail,
        timestamp: serverTimestamp() as any, // Cast to any to satisfy type temporarily
    };
    addDocumentNonBlocking(activityLogCollection, activityData);
=======
    displayName: user.displayName,
=======
    displayName: user.displayName || user.email?.split('@')[0],
>>>>>>> e72cfff (Nas regras clt, precisamos poder especificar o banco também, exemplo:)
    role: role,
  };

  // Use the non-blocking update which also handles permission errors
  // Use merge: false to ensure we are creating, not updating
  setDocumentNonBlocking(userRef, userData, { merge: false });
>>>>>>> 91bbab7 (Ok ok, agora vamos as melhorias que eu disse, configuração por usuário,)
}
