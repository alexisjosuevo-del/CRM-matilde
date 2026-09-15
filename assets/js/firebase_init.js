// Firebase INIT + Auth (CDN v10.12.5) sin type=module
(async function() {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
    const { getAuth, signInAnonymously, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");

    window.firebaseConfig = {
      apiKey: "AIzaSyCJIEj6ODZ3fufr8SYruCpkhuYOnWnxvOw",
      authDomain: "crm-matilde.firebaseapp.com",
      projectId: "crm-matilde",
      storageBucket: "crm-matilde.firebasestorage.app",
      messagingSenderId: "723653950279",
      appId: "1:723653950279:web:bbcf472b5e2a6fc9c32a62"
    };

    window.firebaseApp = initializeApp(window.firebaseConfig);
    window.firebaseDb = getFirestore(window.firebaseApp);
    const auth = getAuth(window.firebaseApp);
    signInAnonymously(auth).catch((e) => console.error("[auth] signInAnonymously:", e));
    onAuthStateChanged(auth, (user) => {
      console.log(user ? "[auth] listo (uid="+user.uid+")" : "[auth] sin sesión");
    });
  } catch(e) {
    console.error("[firebase_init] Error cargando módulos:", e);
  }
})();
