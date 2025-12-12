import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1HZLZRY9UADNnDVBnoBIlG3b-bCkojxs",
  authDomain: "primeinvestproject2.firebaseapp.com",
  projectId: "primeinvestproject2",
  storageBucket: "primeinvestproject2.firebasestorage.app",
  messagingSenderId: "798977477628",
  appId: "1:798977477628:web:c97d1fba72ad7865864079"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const list = document.getElementById("vipList");

async function loadRequests(){
  list.innerHTML = "";
  const snap = await getDocs(collection(db,"vip_requests"));

  snap.forEach(d=>{
    const r = d.data();
    if(r.status !== "pending") return;

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div>User: ${r.userId}</div>
      <div>VIP ${r.vipLevel} — $${r.price}</div>
      <button onclick="approve('${d.id}','${r.userId}',${r.vipLevel},${r.price})">
        APPROVE
      </button>
    `;
    list.appendChild(div);
  });
}

window.approve = async function(reqId,userId,vipLevel,price){
  // Activate VIP in USERS
  await updateDoc(doc(db,"users",userId),{
    vip:{
      level:vipLevel,
      price:price,
      rate:getRate(vipLevel),
      lastProfitAt:serverTimestamp()
    }
  });

  // Mark request approved
  await updateDoc(doc(db,"vip_requests",reqId),{
    status:"approved",
    approvedAt:serverTimestamp()
  });

  alert("VIP ACTIVATED");
  loadRequests();
};

function getRate(v){
  return {
    1:2.33,2:3.33,3:3.66,4:3.99,
    5:4.33,6:4.99,7:6.99,8:7.33
  }[v];
}

loadRequests();
