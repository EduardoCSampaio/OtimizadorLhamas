'use client';

import { doc, setDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { setDocumentNonBlocking } from './non-blocking-updates';

/**
 * Creates a user profile document in Firestore.
 * @param firestore - The Firestore instance.
 * @param user - The Firebase Auth user object.
 */
export async function createUserProfile(firestore: Firestore, user: User) {
  const userRef = doc(firestore, 'users', user.uid);

  // Assign 'master' role if the email matches, otherwise 'user'
  const role = user.email === 'eduardo.campos@lhamascred.com.br' ? 'master' : 'user';

  const userData = {
    id: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: role,
  };

  // Use the non-blocking update which also handles permission errors
  setDocumentNonBlocking(userRef, userData, { merge: false });
}
