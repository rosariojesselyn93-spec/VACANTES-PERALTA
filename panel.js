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

// 1. Función para listar las vacantes y procesar enlaces o correos de contacto
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

            let estadoTexto = "Pendiente";
            let estadoColor = "#ffc107"; // Amarillo
            
            if (vacante.estado === "publicada") {
                estadoTexto = "Publicada";
                estadoColor = "#28a745"; // Verde
            } else if (vacante.estado === "cerrada") {
                estadoTexto = "Cerrada";
                estadoColor = "#6c757d"; // Gris
            }

            let contactoHTML = "";
            const correoValor = vacante.correo || "N/A";

            if (correoValor.startsWith("http://") || correoValor.startsWith("https://")) {
                contactoHTML = `<a href="${correoValor}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline; font-weight: bold;">Ir al formulario / enlace</a>`;
            } else if (correoValor.includes("@")) {
                contactoHTML = `<a href="mailto:${correoValor}" style="color: #007bff; text-decoration: none;">${correoValor}</a>`;
            } else {
                contactoHTML = correoValor;
            }

            const div = document.createElement("div");
            div.className = "vacante-item";
            div.style.cssText = "border: 1px solid #D8CEC1; padding: 20px; border-radius: 8px; margin-bottom: 15px; background: #F8F6F2;";
            
            div.innerHTML = `
                <h4 style="margin: 0 0 10px 0; color: #A05C3F; font-size: 1.2rem;">${vacante.puesto} (${vacante.empresa || "Sin empresa"})</h4>
                <p style="margin: 5px 0;"><strong>Ubicación:</strong> ${vacante.ubicacion || "No especificada"}</p>
                <p style="margin: 5px 0;"><strong>Tipo de Contrato:</strong> ${vacante.tipoContrato || "No especificado"}</p>
                <p style="margin: 5px 0;"><strong>Salario:</strong> ${vacante.salario || "A convenir"} | <strong>Horario:</strong> ${vacante.horario || "No especificado"}</p>
                
                <div style="margin: 10px 0;"><strong>Descripción:</strong> <div style="background:#fff; padding:10px; border-radius:6px; border:1px solid #D8CEC1; margin-top:4px;">${vacante.descripcion || "N/A"}</div></div>
                <div style="margin: 10px 0;"><strong>Requisitos:</strong> <div style="background:#fff; padding:10px; border-radius:6px; border:1px solid #D8CEC1; margin-top:4px;">${vacante.requisitos || "N/A"}</div></div>
                <div style="margin: 10px 0;"><strong>Beneficios:</strong> <div style="background:#fff; padding:10px; border-radius:6px; border:1px solid #D8CEC1; margin-top:4px;">${vacante.beneficios || "N/A"}</div></div>
                
                <p style="margin: 5px 0;"><strong>Contacto:</strong> ${contactoHTML}</p>
                <p style="margin: 5px 0;">
                    <strong>Estado:</strong> 
                    <span style="color: ${estadoColor}; font-weight: bold; padding: 3px 8px; border-radius: 4px; background: #fff;">
                        ${estadoTexto}
                    </span>
                </p>
                <div style="margin-top: 15px;">
                    ${vacante.estado !== "cerrada" ? `<button class="btn-cerrar" data-id="${vacanteId}" style="background: #ffc107; color: #000; padding: 6px 12px; margin-right: 5px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Cerrar</button>` : ''}
                    <button class="btn-eliminar" data-id="${vacanteId}" style="background: #dc3545; color: white; padding: 6px 12px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Eliminar</button>
                </div>
            `;

            div.querySelector(".btn-cerrar")?.addEventListener("click", async () => {
                if (confirm("¿Marcar esta vacante como cerrada?")) {
                    await updateDoc(doc(db, "vacantes", vacanteId), { estado: "cerrada" });
                    cargarMisVacantes(uidEmpresa);
                }
            });

            div.querySelector(".btn-eliminar").addEventListener("click", async () => {
                if (confirm("¿Eliminar permanentemente esta vacante?")) {
                    await deleteDoc(doc(db, "vacantes", vacanteId));
                    cargarMisVacantes(uidEmpresa);
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

            // Lecturas seguras de los campos del formulario
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
                estado: "pendiente",
                fechaCreacion: new Date()
            };

            try {
                const docRef = await addDoc(collection(db, "vacantes"), nuevaVacante);
                console.log("🎉 Vacante guardada con ID:", docRef.id);
                alert("¡Vacante enviada con éxito! Está en revisión.");
                
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