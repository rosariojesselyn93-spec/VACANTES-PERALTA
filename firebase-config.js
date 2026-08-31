// Importar Firebase SDK v10.8.0 (Estandarizado)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA-5cjJsbQ0dtIcrKLlcC62_8oaO0MhplI",
  authDomain: "vacantes-peralta.firebaseapp.com",
  projectId: "vacantes-peralta",
  storageBucket: "vacantes-peralta.firebasestorage.app",
  messagingSenderId: "451345536120",
  appId: "1:451345536120:web:33906131388814e0b4898d",
  measurementId: "G-HD6HH4HC8T"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Crear conexiones
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar para usar en otros archivos
export { db, auth };