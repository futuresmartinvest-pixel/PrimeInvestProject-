import { auth, db, storage } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// ----------------------------
// ADMIN UID
// ----------------------------
const ADMIN_UID = "za934MEck4Qd3IK2pHqplS6WPBe2";
document.getElementById("adminUID").innerText = ADMIN_UID;

// ----------------------------
// AUTH CHECK
// ----------------------------
onAuthStateChanged(auth, (user) => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("ACCESS DENIED — Admin only");
    location.href = "index.html";
  } else {
    loadTasks();
  }
});

// ----------------------------
// CREATE NEW TASK
// ----------------------------
document.getElementById("createTaskBtn").addEventListener("click", async () => {

  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const reward = parseFloat(document.getElementById("taskReward").value);
  const timer = parseInt(document.getElementById("taskTimer").value);
  const link = document.getElementById("taskLink").value.trim();
  const imageFile = document.getElementById("taskImage").files[0];

  if (!title || !description || !reward || !timer || !link || !imageFile) {
    return alert("Please fill all fields and select an image.");
  }

  // Upload image
  const imgRef = ref(storage, "taskImages/" + Date.now() + "_" + imageFile.name);
  await uploadBytes(imgRef, imageFile);
  const imageUrl = await getDownloadURL(imgRef);

  // Save task
  await addDoc(collection(db, "tasks"), {
    title,
    description,
    reward,
    timer,
    linkUrl: link,
    imageUrl,
    createdAt: Date.now()
  });

  alert("Task created successfully!");
  document.querySelector("input, textarea").value = "";
});

// ----------------------------
// LOAD TASKS REAL-TIME
// ----------------------------
function loadTasks() {
  const list = document.getElementById("taskList");

  onSnapshot(collection(db, "tasks"), (snapshot) => {
    list.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const t = docSnap.data();

      const box = document.createElement("div");
      box.className = "task-card";

      box.innerHTML = `
        <img src="${t.imageUrl}">
        <h3>${t.title}</h3>
        <p>${t.description}</p>
        <p><b>Reward:</b> $${t.reward.toFixed(2)}</p>
        <p><b>Timer:</b> ${t.timer} seconds</p>
        <p><b>Link:</b> ${t.linkUrl}</p>

        <button class="delete-btn" onclick="deleteTask('${docSnap.id}')">Delete Task</button>
      `;

      list.appendChild(box);
    });
  });
}

// ----------------------------
// DELETE TASK
// ----------------------------
window.deleteTask = async function (taskId) {
  if (!confirm("Delete this task?")) return;

  await deleteDoc(doc(db, "tasks", taskId));
  alert("Task deleted.");
};
