import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// -----------------------------
// ADMIN UID (only YOU)
// -----------------------------
const ADMIN_UID = "3xM6WyDqPTVkX0L4sOTNQ8f4VWO2";
document.getElementById("adminUID").textContent = ADMIN_UID;

// -----------------------------
// AUTH CHECK
// -----------------------------
onAuthStateChanged(auth, (user) => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin Only.");
    location.href = "index.html";
    return;
  }

  loadPendingDeposits();
  loadPendingWithdrawals();
});

// -----------------------------
// LOAD PENDING DEPOSITS
// -----------------------------
function loadPendingDeposits() {
  const box = document.getElementById("pendingDeposits");

  const q = query(
    collection(db, "transactions"),
    where("status", "==", "pending"),
    where("type", "==", "deposit")
  );

  onSnapshot(q, (snapshot) => {
    box.innerHTML = "";

    if (snapshot.empty) {
      box.innerHTML = "<p>No pending deposits.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const t = docSnap.data();

      const div = document.createElement("div");
      div.className = "transaction-box";

      div.innerHTML = `
        <p><b>User:</b> ${t.userID}</p>
        <p><b>Amount:</b> £${t.amount.toFixed(2)}</p>
        <p><b>Date:</b> ${t.timestamp?.toDate().toLocaleString()}</p>

        <button class="approve-btn" onclick="approveDeposit('${docSnap.id}', '${t.userID}', ${t.amount})">Approve</button>
        <button class="reject-btn" onclick="rejectTransaction('${docSnap.id}')">Reject</button>
      `;

      box.appendChild(div);
    });
  });
}

// -----------------------------
// LOAD PENDING WITHDRAWALS
// -----------------------------
function loadPendingWithdrawals() {
  const box = document.getElementById("pendingWithdrawals");

  const q = query(
    collection(db, "transactions"),
    where("status", "==", "pending"),
    where("type", "==", "withdraw")
  );

  onSnapshot(q, (snapshot) => {
    box.innerHTML = "";

    if (snapshot.empty) {
      box.innerHTML = "<p>No pending withdrawals.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const t = docSnap.data();

      const div = document.createElement("div");
      div.className = "transaction-box";

      div.innerHTML = `
        <p><b>User:</b> ${t.userID}</p>
        <p><b>Amount:</b> £${t.amount.toFixed(2)}</p>
        <p><b>Date:</b> ${t.timestamp?.toDate().toLocaleString()}</p>

        <button class="approve-btn" onclick="approveWithdrawal('${docSnap.id}', '${t.userID}', ${t.amount})">Approve</button>
        <button class="reject-btn" onclick="rejectTransaction('${docSnap.id}')">Reject</button>
      `;

      box.appendChild(div);
    });
  });
}

// -----------------------------
// APPROVE DEPOSIT
// -----------------------------
window.approveDeposit = async function (transactionID, userID, amount) {

  const userRef = doc(db, "users", userID);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return alert("User not found.");

  const currentBalance = userSnap.data().balance ?? 0;

  // Update balance
  await updateDoc(userRef, {
    balance: currentBalance + amount
  });

  // Mark transaction as approved
  await updateDoc(doc(db, "transactions", transactionID), {
    status: "approved"
  });

  alert("Deposit approved!");
};

// -----------------------------
// APPROVE WITHDRAWAL
// -----------------------------
window.approveWithdrawal = async function (transactionID, userID, amount) {

  const userRef = doc(db, "users", userID);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return alert("User not found.");

  const currentBalance = userSnap.data().balance ?? 0;

  if (amount > currentBalance) {
    return alert("User does not have enough balance!");
  }

  // Update balance
  await updateDoc(userRef, {
    balance: currentBalance - amount
  });

  // Mark transaction as approved
  await updateDoc(doc(db, "transactions", transactionID), {
    status: "approved"
  });

  alert("Withdrawal approved!");
};

// -----------------------------
// REJECT ANY TRANSACTION
// -----------------------------
window.rejectTransaction = async function (transactionID) {
  await updateDoc(doc(db, "transactions", transactionID), {
    status: "rejected"
  });

  alert("Transaction rejected.");
};
