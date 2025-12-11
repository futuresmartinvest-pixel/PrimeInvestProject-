import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ----------------------------
// ADMIN UID (ONLY YOU)
// ----------------------------
const ADMIN_UID = "za934MEck4Qd3IK2pHqplS6WPBe2";

// Safe update of admin UID text
const adminUIDBox = document.getElementById("adminUID");
if (adminUIDBox) adminUIDBox.textContent = ADMIN_UID;

// ----------------------------
// AUTH CHECK
// ----------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must log in first.");
    location.href = "index.html";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    alert("ACCESS DENIED — Admin only.");
    location.href = "index.html";
    return;
  }

  loadVIPRequests();
});

// ----------------------------
// REAL-TIME VIP REQUESTS
// ----------------------------
async function loadVIPRequests() {
  const container = document.getElementById("requests");
  container.innerHTML = "Loading…";

  const q = query(collection(db, "vipRequests"), where("status", "==", "pending"));

  onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      container.innerHTML = "<p>No pending VIP requests.</p>";
      return;
    }

    container.innerHTML = "";

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // Load full user info
      const userDoc = await getDoc(doc(db, "users", data.userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      const email = data.email || userData.email || "Unknown Email";

      const box = document.createElement("div");
      box.className = "request-box";

      box.innerHTML = `
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>User ID:</strong> ${data.userId}</p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Requested At:</strong> ${new Date(data.timestamp).toLocaleString()}</p>

        <button class="btn approve" onclick="approveVIP('${docSnap.id}', '${data.userId}')">Approve</button>
        <button class="btn reject" onclick="rejectVIP('${docSnap.id}', '${data.userId}')">Reject</button>
      `;

      container.appendChild(box);
    }
  });
}

// ----------------------------
// APPROVE VIP
// ----------------------------
window.approveVIP = async function (docId, userId) {
  try {
    await updateDoc(doc(db, "users", userId), {
      vipStatus: "approved"  // FIXED from "active"
    });

    await deleteDoc(doc(db, "vipRequests", docId));

    alert("VIP Approved!");
  } catch (err) {
    alert("Error approving VIP: " + err.message);
  }
};

// ----------------------------
// REJECT VIP
// ----------------------------
window.rejectVIP = async function (docId, userId) {
  try {
    await updateDoc(doc(db, "users", userId), {
      vipStatus: "rejected"
    });

    await deleteDoc(doc(db, "vipRequests", docId));

    alert("VIP Rejected!");
  } catch (err) {
    alert("Error rejecting VIP: " + err.message);
  }
};
