import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc,
  getDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA-5cjJsbQ0dtIcrKLlcC62_8oaO0MhplI",
  authDomain: "vacantes-peralta.firebaseapp.com",
  databaseURL: "https://vacantes-peralta-default-rtdb.firebaseio.com",
  projectId: "vacantes-peralta",
  storageBucket: "vacantes-peralta.firebasestorage.app",
  messagingSenderId: "451345536120",
  appId: "1:451345536120:web:33906131388814e0b4898d",
  measurementId: "G-HD6HH4HC8T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- CONTROL DE PESTAÑAS (TABS) ---
const tabLogin = document.getElementById('tab-login');
const tabRegistro = document.getElementById('tab-registro');
const loginForm = document.getElementById('login-form');
const registroForm = document.getElementById('registro-form');

if (tabLogin && tabRegistro && loginForm && registroForm) {
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegistro.classList.remove('active');
    loginForm.classList.add('active');
    registroForm.classList.remove('active');
  });

  tabRegistro.addEventListener('click', () => {
    tabRegistro.classList.add('active');
    tabLogin.classList.remove('active');
    registroForm.classList.add('active');
    loginForm.classList.remove('active');
  });
}

// --- LÓGICA DE INICIO DE SESIÓN (LOGIN) ---
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    if (loginError) loginError.textContent = '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Ingresando...';
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.rol === 'empresa') {
          window.location.href = 'panel-empresa.html';
        } else {
          window.location.href = 'index.html';
        }
      } else {
        window.location.href = 'panel-empresa.html';
      }

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      if (loginError) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          loginError.textContent = 'Correo o contraseña incorrectos.';
        } else {
          loginError.textContent = 'Error al ingresar: ' + error.message;
        }
      }
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Ingresar';
      }
    }
  });
}

// --- LÓGICA DE REGISTRO ---
if (registroForm) {
  registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rolInput = document.getElementById('rol');
    const mensajeError = document.getElementById('mensaje-error');
    const submitBtn = registroForm.querySelector('button[type="submit"]');

    if (!nombreInput || !emailInput || !passwordInput || !rolInput) return;

    const nombre = nombreInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const rol = rolInput.value;

    if (mensajeError) mensajeError.textContent = '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creando cuenta...';
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        nombre: nombre,
        email: email,
        rol: rol,
        fechaCreacion: serverTimestamp()
      });

      if (rol === 'empresa') {
        window.location.href = 'panel-empresa.html';
      } else {
        window.location.href = 'index.html';
      }

    } catch (error) {
      console.error("Error en registro:", error);
      if (mensajeError) {
        if (error.code === 'auth/email-already-in-use') {
          mensajeError.textContent = 'Este correo ya está registrado.';
        } else if (error.code === 'auth/weak-password') {
          mensajeError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        } else {
          mensajeError.textContent = 'Error al registrar: ' + error.message;
        }
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear Cuenta';
      }
    }
  });
}