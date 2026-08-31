import { db } from "./firebase-config.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    doc,
    updateDoc,
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const auth = getAuth();
console.log("⚡ panel.js reiniciado desde cero.");

// Funciones globales de formato de texto
window.formatText = function(command, targetId) {
    const editor = document.getElementById(targetId);
    if (editor) {
        editor.focus();
        document.execCommand(command, false, null);
    }
};

window.changeFontName = function(fontName, targetId) {
    const editor = document.getElementById(targetId);
    if (editor) {
        editor.focus();
        document.execCommand('fontName', false, fontName);
    }
};

window.changeFontSize = function(size, targetId) {
    const editor = document.getElementById(targetId);
    if (editor && size) {
        editor.focus();
        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) return;
        const range = selection.getRangeAt(0);
        const span = document.createElement("span");
        span.style.fontSize = size;
        span.appendChild(range.extractContents());
        range.insertNode(span);
    }
};

// 1. Función para listar las vacantes de forma resumida y compacta
async function cargarMisVacantes(uidEmpresa) {
    const contenedor = document.getElementById("lista-vacantes");
    if (!contenedor) return;

    contenedor.innerHTML = "<p>Cargando tus vacantes...</p>";

    try {
        const q = query(collection(db, "vacantes"), where("uidEmpresa", "==", uidEmpresa));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            contenedor.innerHTML = "<p>Aún no has publicado ninguna vacante.</p>";
            return;
        }

        contenedor.innerHTML = "";
        querySnapshot.forEach((docSnap) => {
            const vacante = docSnap.data();
            const vacanteId = docSnap.id;

            // Formatear la fecha de creación de forma segura
            let fechaFormateada = "Fecha no disponible";
            if (vacante.fechaCreacion) {
                if (typeof vacante.fechaCreacion.toDate === 'function') {
                    fechaFormateada = vacante.fechaCreacion.toDate().toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                } else {
                    fechaFormateada = new Date(vacante.fechaCreacion).toLocaleDateString('es-ES');
                }
            }

            const div = document.createElement("div");
            div.className = "vacante-item-resumido";
            
            div.innerHTML = `
                <div class="vacante-info-principal">
                    <span class="vacante-titulo-puesto">${vacante.puesto || "Sin puesto"} <span style="font-weight: normal; color: #666;">(${vacante.empresa || "Sin empresa"})</span></span>
                    <span class="vacante-fecha-pub">Publicada el: ${fechaFormateada}</span>
                </div>
                <div class="vacante-acciones-botones">
                    <a href="detalle.html?id=${vacanteId}" class="btn-accion-panel btn-ver-completa" target="_blank" rel="noopener noreferrer">Ver</a>
                    ${vacante.estado !== "cerrada" ? `<button type="button" class="btn-accion-panel btn-cerrar-vacante" data-id="${vacanteId}">Cerrar</button>` : ''}
                    <button type="button" class="btn-accion-panel btn-eliminar-vacante" data-id="${vacanteId}">Eliminar</button>
                </div>
            `;

            // Evento para cerrar vacante
            const btnCerrar = div.querySelector(".btn-cerrar-vacante");
            if (btnCerrar) {
                btnCerrar.addEventListener("click", async () => {
                    if (confirm("¿Marcar esta vacante como cerrada?")) {
                        try {
                            await updateDoc(doc(db, "vacantes", vacanteId), { estado: "cerrada" });
                            cargarMisVacantes(uidEmpresa);
                        } catch (err) {
                            console.error("Error al cerrar vacante:", err);
                        }
                    }
                });
            }

            // Evento para eliminar vacante
            div.querySelector(".btn-eliminar-vacante").addEventListener("click", async () => {
                if (confirm("¿Eliminar permanentemente esta vacante?")) {
                    try {
                        await deleteDoc(doc(db, "vacantes", vacanteId));
                        cargarMisVacantes(uidEmpresa);
                    } catch (err) {
                        console.error("Error al eliminar vacante:", err);
                    }
                }
            });

            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error("Error al cargar vacantes:", error);
        contenedor.innerHTML = "<p>Error al cargar tus publicaciones.</p>";
    }
}

// 2. Control de Autenticación
onAuthStateChanged(auth, async (user) => {
    const bienvenidaEl = document.getElementById("nombre-usuario");

    if (user) {
        try {
            const empresaRef = collection(db, "empresa");
            const qEmpresa = query(empresaRef, where("email", "==", user.email));
            const querySnapshot = await getDocs(qEmpresa);

            if (!querySnapshot.empty) {
                const empresaDoc = querySnapshot.docs[0];
                const data = empresaDoc.data();
                if (bienvenidaEl) {
                    bienvenidaEl.innerText = data.nombreEmpresa || data.nombre || user.email;
                }
            } else {
                if (bienvenidaEl) bienvenidaEl.innerText = user.email;
            }

            cargarMisVacantes(user.uid);

        } catch (error) {
            console.error("❌ Error al verificar empresa:", error);
            if (bienvenidaEl) bienvenidaEl.innerText = user.email;
        }
    } else {
        window.location.href = "login.html";
    }
});

// 3. Configuración de Eventos del DOM
document.addEventListener("DOMContentLoaded", () => {
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "login.html";
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
            }
        });
    }

    const formVacante = document.getElementById("form-vacante");
    if (formVacante) {
        formVacante.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("📨 Formulario enviado, procesando vacante...");

            const user = auth.currentUser;
            if (!user) {
                alert("Sesión expirada. Por favor, vuelve a iniciar sesión.");
                window.location.href = "login.html";
                return;
            }

            const inputEmpresa = document.getElementById("empresa");
            const inputPuesto = document.getElementById("puesto");
            const inputUbicacion = document.getElementById("ubicacion");
            const inputTipoContrato = document.getElementById("tipoContrato");
            const inputSalario = document.getElementById("salario");
            const inputHorario = document.getElementById("horario");
            const inputCorreo = document.getElementById("correo");

            const descEditor = document.getElementById("desc-editor");
            const reqEditor = document.getElementById("req-editor");
            const benEditor = document.getElementById("ben-editor");

            const nuevaVacante = {
                empresa: inputEmpresa ? inputEmpresa.value.trim() : "",
                puesto: inputPuesto ? inputPuesto.value.trim() : "",
                ubicacion: inputUbicacion ? inputUbicacion.value.trim() : "",
                tipoContrato: inputTipoContrato ? inputTipoContrato.value.trim() : "",
                salario: inputSalario ? inputSalario.value.trim() : "",
                horario: inputHorario ? inputHorario.value.trim() : "",
                descripcion: descEditor ? descEditor.innerHTML.trim() : "",
                requisitos: reqEditor ? reqEditor.innerHTML.trim() : "",
                beneficios: benEditor ? benEditor.innerHTML.trim() : "",
                correo: inputCorreo ? inputCorreo.value.trim() : "",
                uidEmpresa: user.uid,
                estado: "publicada",
                fechaCreacion: new Date()
            };

            try {
                const docRef = await addDoc(collection(db, "vacantes"), nuevaVacante);
                console.log("🎉 Vacante guardada con ID:", docRef.id);
                alert("¡Vacante publicada con éxito!");
                
                formVacante.reset();
                if (descEditor) descEditor.innerHTML = "";
                if (reqEditor) reqEditor.innerHTML = "";
                if (benEditor) benEditor.innerHTML = "";

                cargarMisVacantes(user.uid);
            } catch (error) {
                console.error("🔥 Error al guardar la vacante en Firestore:", error);
                alert("Error al guardar: " + error.message);
            }
        });
    }
});