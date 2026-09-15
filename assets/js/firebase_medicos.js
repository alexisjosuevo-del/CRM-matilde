// firebase_medicos.js — Clientes AAA en Firestore (coleccion: clientes)
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, collection, query, onSnapshot, getDocsFromServer
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getAuth, signInAnonymously, setPersistence, inMemoryPersistence
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const app = getApps()[0] || initializeApp(window.FIREBASE_CONFIG);
const db  = getFirestore(app);

// Auth anonima para poder leer y escribir
(async () => {
  try {
    const auth = getAuth(app);
    await setPersistence(auth, inMemoryPersistence);
    await signInAnonymously(auth);
    window.firebaseApp = app;
    window.firebaseDb  = db;
    console.log("[clientes] auth anon listo");
  } catch (e) {
    window.firebaseApp = app;
    window.firebaseDb  = db;
    console.warn("[clientes] auth anon:", e);
  }
})();

function updateCounter(total) {
  const el = document.querySelector("#medCount") || document.querySelector("#medCountSide");
  if (el) el.textContent = total;
}

function renderIfAvailable(docs) {
  if (typeof window.renderMedicos === "function") {
    try { window.renderMedicos(docs); } catch(e) { console.warn(e); }
  }
  window.__medicosDocs = docs;
  window.MED_BASE = docs;
}

// Realtime listener sobre la coleccion "clientes"
const q = query(collection(db, "clientes"));
onSnapshot(q, { includeMetadataChanges: true }, (snap) => {
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  updateCounter(snap.size);
  renderIfAvailable(docs);
  document.dispatchEvent(new CustomEvent("medicos:snapshot", { detail: { docs, fromCache: snap.metadata.fromCache === true } }));
}, (err) => {
  console.error("[clientes] onSnapshot error:", err);
});

window.forceMedicosFromServer = async function () {
  const snap = await getDocsFromServer(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  updateCounter(snap.size);
  renderIfAvailable(docs);
};
