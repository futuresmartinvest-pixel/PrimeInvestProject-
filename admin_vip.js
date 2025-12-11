import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ----------------------------------------------------------
//  IMPORTANT: SET YOUR ADMIN UID HERE
// ----------------------------------------------------------
export const ADMIN_UID = "za934MEck4Qd3IK2pHqplS6WPBe2"; 
// Replace ONLY if your admin UID changes.

// ----------------------------------------------------------
//  CHECK IF USER IS ADMIN
// ----------------------------------------------------------
export async function checkAdmin() {
  const user = auth.currentUser;

  if (!user) {
    alert("You must log in first.");
    window.location.href = "index.html";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    alert("You are NOT an admin!");
    window.location.href = "index.html";
  }
}

// ----------------------------------------------------------
//  LOAD ALL VIP REQUESTS LIVE
// ----------------------------------------------------------
export function loadVIPRequests(callback) {
  const colRef = collection(db, "vipRequests");

  onSnapshot(colRef, (snapshot) => {
    const requests = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      requests.push({
        id: docSnap.id,
        userId: data.userId,
        email: data.email,
        status: data.status,
      });
    });

    callback(requests);
  });
}

// ----------------------------------------------------------
//  APPROVE VIP REQUEST
// ----------------------------------------------------------
export async function approveVIP(req) {
  try {
    // Update VIP request status
    await updateDoc(doc(db, "vipRequests", req.id), {
      status: "approved",
    });

    // Update user VIP status in users collection
    await updateDoc(doc(db, "users", req.userId), {
      vipStatus: "approved",
    });

    alert(`VIP Approved for: ${req.email}`);
  } catch (error) {
    console.error(error);
    alert("Error approving VIP request.");
  }
}

// ----------------------------------------------------------
//  REJECT VIP REQUEST
// ----------------------------------------------------------
export async function rejectVIP(req) {
  try {
    await updateDoc(doc(db, "vipRequests", req.id), {
      status: "rejected",
    });

    await updateDoc(doc(db, "users", req.userId), {
      vipStatus: "rejected",
    });

    alert(`VIP Rejected for: ${req.email}`);
  } catch (error) {
    console.error(error);
    alert("Error rejecting VIP request.");
  }
}
