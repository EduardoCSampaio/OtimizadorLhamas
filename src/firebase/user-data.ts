'use client';

import { doc, setDoc, Firestore, collection, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { addDocumentNonBlocking } from './non-blocking-updates';
import type { Activity } from '@/lib/types';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';


/**
 * Creates a user profile document in Firestore and logs the sign-up event.
 * @param firestore - The Firestore instance.
 * @param user - The Firebase Auth user object.
 */
export function createUserProfile(firestore: Firestore, user: User) {
  const userRef = doc(firestore, 'users', user.uid);
  const role = user.email === 'eduardo.campos@lhamascred.com.br' ? 'master' : 'user';

  const userData = {
    id: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0],
    role: role,
  };

  // Use setDoc with non-blocking error handling
  setDoc(userRef, userData, { merge: false })
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

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
}