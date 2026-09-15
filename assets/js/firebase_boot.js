
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJIEj6ODZ3fufr8SYruCpkhuYOnWnxvOw",
  authDomain: "crm-matilde.firebaseapp.com",
  projectId: "crm-matilde",
  storageBucket: "crm-matilde.firebasestorage.app",
  messagingSenderId: "723653950279",
  appId: "1:723653950279:web:bbcf472b5e2a6fc9c32a62"
};

if (!getApps().length) initializeApp(firebaseConfig);
window.DB = getFirestore();
