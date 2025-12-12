// ---------------------------------------------------------
// IMPORTS (Firebase v10 CDN)
// ---------------------------------------------------------
import { auth, db } from "./firebase.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ---------------------------------------------------------
// ADMIN UID — ONLY YOU!
// ---------------------------------------------------------
export const ADMIN_UID = "3xM6WyDqPTVkX0L4sOTNQ8f4VWO2"; // <-- your admin UID

// ---------------------------------------------------------
// Load & Display Pending VIP Requests
// ---------------------------------------------------------
function loadVIPRequests() {
  const container = document.getElementById("vipRequestsContainer");
  container.innerHTML = "<p>Loading requests...</p>";

  const q = query(collection(db, "vip_requests"), where("approved", "==", false));

  onSnapshot(q, (snapshot) => {
    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = "<p>No pending VIP requests.</p>";
      return;
    }

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();

      const card = document.createElement("div");
      card.style =
        "background:white;padding:15px;margin-bottom:15px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);";

      card.innerHTML = `
        <p><b>User:</b> ${data.email}</p>
        <p><b>UID:</b> ${data.uid}</p>
        <button class="approveBtn">Approve VIP</button>
        <button class="rejectBtn" style="background:red;color:white;margin-left:10px;">Reject</button>
      `;

      // Approve button
      card.querySelector(".approveBtn").onclick = () =>
        approveVIP(docSnap.id, data.uid);

      // Reject button
      card.querySelector(".rejectBtn").onclick = () =>
        rejectVIP(docSnap.id);

      container.appendChild(card);
    });
  });
}

// ---------------------------------------------------------
// Approve VIP
// ---------------------------------------------------------
async function approveVIP(requestId, userUID) {
  try {
    // Update user document
    const userRef = doc(db, "users", userUID);
    await updateDoc(userRef, {
      vip: true,
      vipRequested: false
    });

    // Remove request
    await deleteDoc(doc(db, "vip_requests", requestId));

    alert("VIP approved!");
  } catch (err) {
    alert("Error approving VIP: " + err.message);
  }
}

// ---------------------------------------------------------
// Reject VIP
// ---------------------------------------------------------
async function rejectVIP(requestId) {
  try {
    await deleteDoc(doc(db, "vip_requests", requestId));
    alert("VIP request rejected.");
  } catch (err) {
    alert("Error rejecting: " + err.message);
  }
}

// ---------------------------------------------------------
// Initialize Admin VIP Page
// ---------------------------------------------------------
export function initAdminVIP() {
  const container = document.getElementById("vipRequestsContainer");

  if (!container) {
    console.error("Missing <div id='vipRequestsContainer'>");
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      container.innerHTML = "<p>Please log in as admin.</p>";
      return;
    }

    if (user.uid !== ADMIN_UID) {
      container.innerHTML = "<p>Access denied. Admin only.</p>";
      return;
    }

    loadVIPRequests();
  });
}
