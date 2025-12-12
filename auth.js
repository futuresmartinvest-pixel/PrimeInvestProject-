// ------------------------------------------------------
// ADMIN UID (Set Your Admin User ID Here)
// ------------------------------------------------------
export const ADMIN_UID = "3xM6WyDqPTVkX0L4sOTNQ8f4VWO2";

// ------------------------------------------------------
// Firebase Imports
// ------------------------------------------------------
import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ------------------------------------------------------
// REGISTER USER
// ------------------------------------------------------
export async function registerUser(name, email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(cred.user, { displayName: name });

    // Create Firestore user document
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      uid: cred.user.uid,
      vip: false,
      balance: 0,
      referralCode: cred.user.uid.substring(0, 6),
      invitedBy: null,
      createdAt: Date.now()
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ------------------------------------------------------
// LOGIN USER
// ------------------------------------------------------
export async function loginUser(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ------------------------------------------------------
// ON AUTH STATE CHANGED
// ------------------------------------------------------
export function watchAuthState(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null);

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return callback(null);

    callback({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      vip: snap.data().vip,
      balance: snap.data().balance,
      referralCode: snap.data().referralCode,
      invitedBy: snap.data().invitedBy,
      isAdmin: user.uid === ADMIN_UID
    });
  });
}

// ------------------------------------------------------
// LOGOUT
// ------------------------------------------------------
export function logoutUser() {
  return signOut(auth);
}
