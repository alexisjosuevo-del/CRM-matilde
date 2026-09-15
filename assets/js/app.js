import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
const firebaseConfig = {
  apiKey: "AIzaSyCJIEj6ODZ3fufr8SYruCpkhuYOnWnxvOw",
  authDomain: "crm-matilde.firebaseapp.com",
  projectId: "crm-matilde",
  storageBucket: "crm-matilde.firebasestorage.app",
  messagingSenderId: "723653950279",
  appId: "1:723653950279:web:bbcf472b5e2a6fc9c32a62"
};
initializeApp(firebaseConfig);

// Navegación de tabs (simple)
const tabs = document.querySelectorAll(".tab");
tabs.forEach(t => t.addEventListener("click", () => {
  tabs.forEach(x=>x.classList.remove("active"));
  t.classList.add("active");
  const pane = t.dataset.tab;
  document.querySelectorAll(".tabpane").forEach(p=>p.classList.remove("active"));
  document.getElementById(`tab-${pane}`).classList.add("active");
}));
console.log("Firebase listo");
